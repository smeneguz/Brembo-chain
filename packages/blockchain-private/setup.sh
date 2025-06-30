#!/bin/bash

echo
echo " _____      _            _         ____  _            _        _           _"       
echo "|  __ \    (_)          | |       |  _ \| |          | |      | |         (_)"     
echo "| |__) | __ ___   ____ _| |_ ___  | |_) | | ___   ___| | _____| |__   __ _ _ _ __" 
echo "|  ___/ '__| \ \ / / _\` | __/ _ \ |  _ <| |/ _ \ / __| |/ / __| '_ \ / _\` | | '_ \\" 
echo "| |   | |  | |\ V / (_| | ||  __/ | |_) | | (_) | (__|   < (__| | | | (_| | | | | |"
echo "|_|   |_|  |_| \_/ \__,_|\__\___| |____/|_|\___/ \___|_|\_\___|_| |_|\__,_|_|_| |_|"
echo
echo
echo

sleep 3

set -a            
source ./.env
set +a

artifactPath="./output"

npx quorum-genesis-tool --consensus=$consensus_algorithm --chainID=$chainID --blockperiod=$blockperiodseconds --requestTimeout=$requestTimeoutSeconds --emptyBlockPeriod=$emptyblockperiodseconds --epochLength=$epochLength --difficulty=$difficulty --gasLimit=$gasLimit --coinbase=$coinBaseAddress --maxCodeSize=$maxCodeSize --txnSizeLimit=$transactionSizeLimit --validators=$validators --members=$members --bootnodes=$bootnodes --tesseraEnabled=$useTessera --quickstartDevAccounts=$quorumdevquickstart --genesisNodeAllocation=$balanceInitial

data=$(ls output)

for ((i=0;i<bootnodes;i++))
do
cp -r output/$data/bootnode$i ./nodes
done

for ((i=0;i<members;i++))
do
cp -r output/$data/member$i ./nodes
done

for ((i=0;i<validators;i++))
do
cp -r output/$data/validator$i ./nodes
done

cp -rT output/$data/goQuorum/ ./quorum-docker/

rm -r output

nodes_path=()

for ((i=0; i<$bootnodes; i++))
do
  nodes_path+=( "nodes/bootnode$i/nodekey.pub" )
done

for ((i=0; i<$members; i++))
do
  nodes_path+=( "nodes/member$i/nodekey.pub" )
done

for ((i=0; i<$validators; i++))
do
  nodes_path+=( "nodes/validator$i/nodekey.pub" )
done

while IFS= read -r line
do
  if [[ $line == *"enode://"* ]]; then
    # Estrai la parte dell'URL enode che interessa il confronto
    enode_parte=$(echo "$line" | sed -n 's/enode:\/\/\([^@]*\)@<HOST>:30303?discport=0&raftport=53000/\1/p')
    for node_path in "${nodes_path[@]}"
    do
      if [ -f "$node_path" ]; then
        identificativo_nodo=$(cat "$node_path")
        # Se l'URL enode contiene l'identificativo del nodo, sostituisci <HOST>
        if [[ $enode_parte == *"$identificativo_nodo"* ]]; then
          nodo_nome=$(basename "$(dirname "$(realpath "$node_path")")")
          if [ "$nodo_nome" == "bootnode0" ]; then
            bootnode_key=$identificativo_nodo
          fi
          line=$(echo "$line" | awk -v nodo_nome="$nodo_nome" '{gsub(/<HOST>/, nodo_nome)}1')
        fi
      fi
    done
  fi
  nodi+=("$line")
done < "quorum-docker/static-nodes.json"


ultima_riga=${nodi[-1]}
if [[ $ultima_riga != *"]" ]]; then
  nodi[-1]="$ultima_riga]"
fi
# Sovrascrivi il file JSON con le nuove righe
printf "%s\n" "${nodi[@]}" > "quorum-docker/static-nodes.json"
printf "%s\n" "${nodi[@]}" > "quorum-docker/permissioned-nodes.json"

cat <<EOF > docker-compose.yml
version: '3'
services:
EOF

# Aggiunta delle definizioni di servizi al file Docker Compose
#Considera che in questo modo viene considerato solo il bootnode0, perchè?
#Perchè mi sono rotto.

for ((i=0; i<$bootnodes; i++))
do
    cat <<EOF >> docker-compose.yml
    bootnode$i:
        hostname: bootnode$i
        build: ./quorum-docker
        command: --datadir /root/data
            --nodiscover
            --netrestrict="172.16.254.0/28"
        networks:
            docker-quorum-net:
        volumes:
            - ./nodes/bootnode$i/nodekey:/root/data/nodekey
            - ./nodes/bootnode$i/nodekey.pub:/root/data/nodekey.pub
            - ./nodes/bootnode$i/address:/root/data/address
            - ./quorum-docker/static-nodes.json:/root/data/static-nodes.json
EOF
done

for ((i=0; i<$members; i++))
do
    cat <<EOF >> docker-compose.yml
    member$i:
        hostname: member$i
        build: ./quorum-docker
        command: --datadir /root/data
            --bootnodes="enode://$bootnode_key@bootnode0:30303"
            --http
            --http.addr="0.0.0.0"
            --http.api="eth,web3,net,admin,personal"
            --http.corsdomain="*"
            --ws
            --ws.addr="0.0.0.0"
            --ws.origins="*"
            --netrestrict="172.16.254.0/28"
        ports:
            - '8545:8545'
            - '8546:8546'
        networks:
            docker-quorum-net:
        volumes:
            - ./nodes/member$i/nodekey:/root/data/nodekey
            - ./nodes/member$i/nodekey.pub:/root/data/nodekey.pub
            - ./nodes/member$i/address:/root/data/address
            - ./quorum-docker/static-nodes.json:/root/data/static-nodes.json
EOF
done

for ((i=0; i<$validators; i++))
do
    cat <<EOF >> docker-compose.yml
    validator$i:
        hostname: validator$i
        build: ./quorum-docker
        command: --bootnodes="enode://$bootnode_key@bootnode0:30303"            
            --datadir /root/data
            --mine
            --netrestrict="172.16.254.0/28"
            --syncmode full
        networks:
            docker-quorum-net:
        volumes:
            - ./nodes/validator$i/nodekey:/root/data/nodekey
            - ./nodes/validator$i/nodekey.pub:/root/data/nodekey.pub
            - ./nodes/validator$i/address:/root/data/address
            - ./quorum-docker/static-nodes.json:/root/data/static-nodes.json
EOF
done

cat <<EOF >> docker-compose.yml
networks:
    docker-quorum-net:
        driver: bridge
        ipam:
            config:
                - subnet: 172.16.254.0/28
EOF

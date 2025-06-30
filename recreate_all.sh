cd packages/blockchain-private
docker compose down -v
docker compose up -d
cd ../../contracts
npm run deploy
cd ../contracts-public
npx truffle migrate --network private
cd ../../apps/api
docker exec -i brembochain-db-1 psql -U root -d postgres <<EOF
DROP DATABASE IF EXISTS brembochain;
EOF
npx prisma migrate dev #rigenero il database brembochain pulito

# Configurazione
SFTP_HOST="localhost"
SFTP_PORT=2222 # Cambia se usi una porta diversa
SFTP_USER="username"
SFTP_PASS="password"

# Comandi SFTP
SFTP_COMMANDS=$(cat <<EOF
rm manual_test/certificate/*
rm manual_test/espe_xml/*
cd manual_test
rename processed_xml/ supervisor_new_xml
rename supervisor_xml/ processed_xml
rename supervisor_new_xml supervisor_xml
bye
EOF
)

# Accedi all'SFTP e esegui i comandi
echo "Eseguendo comandi su SFTP..."

sshpass -p "$SFTP_PASS" sftp -P $SFTP_PORT -oBatchMode=no -b - $SFTP_USER@$SFTP_HOST <<END
$SFTP_COMMANDS
END

#npm run start:dev
# ho ancora bisogno di avviare il frontend

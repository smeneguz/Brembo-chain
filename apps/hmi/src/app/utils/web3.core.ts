import Web3 from "web3";
import brakeABI from "../../../../../packages/contracts-public/build/contracts/SupplyChainContract.json";

export function web3() {
  try {
    const web3 = new Web3(Web3.givenProvider || "http://localhost:7545");
    const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS; // Sostituisci con l'indirizzo reale del tuo contratto
    const contract = new web3.eth.Contract(
      brakeABI.abi as any,
      contractAddress
    );

    return { contract, web3 };
  } catch (err: any) {
    console.error(err);
    return err;
  }
}

import useSWR from "swr";
import { web3 } from "../../../utils/web3.core";

export function useNftList() {
  const { data, error, mutate } = useSWR(`getBrakeListOwner`, async () => {
    try {
      const conf = web3();
      const accounts = await conf?.web3.eth.getAccounts();
      const brakeList = await conf?.contract.methods
        .getOwnershipBrake(accounts![0])
        .call();
      console.log(brakeList);
      return brakeList;
    } catch (err: any) {
      console.log(err.message);
      throw new Error(err.message);
    }
  });

  return {
    data, // Qui troverai la connessione (provider, accounts)
    loading: !data && !error, // Se non ci sono dati ed errori, siamo ancora in fase di loading
    error, // Errore se la connessione fallisce
    mutate, // Mutate ti permette di refetchare i dati
  };
}

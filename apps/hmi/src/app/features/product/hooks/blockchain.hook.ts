import useSWR from "swr";
import { web3 } from "../../../utils/web3.core";

// Definisci il fetcher come la tua funzione per connetterti alla blockchain
const fetcher = () => web3();

// Hook personalizzato
export const useBlockchainConnection = () => {
  const { data, error, mutate } = useSWR("web3", fetcher);

  return {
    data, // Qui troverai la connessione (provider, accounts)
    loading: !data && !error, // Se non ci sono dati ed errori, siamo ancora in fase di loading
    error, // Errore se la connessione fallisce
    mutate, // Mutate ti permette di refetchare i dati
  };
};

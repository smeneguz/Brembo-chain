import { Button, ColorPaletteProp, Snackbar, Textarea, Typography, Box } from "@mui/joy";
import { Page } from "../../components/page.component";
import { Wallet } from "../../components/wallet.component";
import { Passkey } from "../../components/passkey.component";
import { useEffect, useState } from "react";
import { http } from "../../core/http.core";
import { useBlockchainConnection } from "./hooks/blockchain.hook";

export function Product() {
  const [engineCode, setEngineCode] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [resultSnackbar, setResultSnackbar] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [passkey, setOpenPasskey] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { data, loading: isLoading, error: blockchainError, mutate } = useBlockchainConnection();

  const handleSearch = async () => {
    if (!engineCode.trim()) {
      setError("Engine code is required");
      setResultSnackbar(2);
      setOpenSnackbar(true);
      return;
    }
    try {
      setLoading(true);
      const result = await http.get(`/brake/${engineCode}`);
      result.data ? setResultSnackbar(1) : setResultSnackbar(0);
      console.log(result);
      setOpenPasskey(true);
    } catch (error: any) {
      console.error('Error searching engine:', error.response.data.message);
      setError(error.response.data.message);
      setResultSnackbar(2);
    } finally {
      setOpenSnackbar(true);
      setLoading(false);
    }
  };

  const handleClose = async () => {
    setOpenSnackbar(false);
    setError(null);
  };

  const handleColor = (): ColorPaletteProp => {
    if (resultSnackbar === 0) {
      return "success";
    }
    if (resultSnackbar === 1) {
      return "warning";
    }
    if (resultSnackbar === 2) {
      return "danger";
    }
    return "danger";
  };

  const handleBody = (): string => {
    if (resultSnackbar === 2) {
      return error!;
    }
    if (resultSnackbar === 0) {
      return "New Codice Motore added to the Public Blockchain";
    }
    if (resultSnackbar === 1) {
      return "Codice Motore already added on Public Blockchain";
    }
    return "Codice Motore already added on Public Blockchain";
  };

  useEffect(() => {
      // Esegui operazioni in base ai dati
      if(data){
      data.web3.eth.getAccounts().then(
        (accounts: any) =>{
          if(accounts.length == 0){
            setIsConnected(false);
            localStorage.removeItem("isConnected")
          } else {
            setIsConnected(true);
            localStorage.removeItem("isConnected")
            localStorage.setItem("isConnected", "connectedToMeta");
          }
        });
      }   
  }, [data]);

  const handleConnectMeta = async () => {
    // Verifica che i dati siano disponibili e che non ci siano errori
    if(window.ethereum){
      await window.ethereum.request({
      method: 'eth_requestAccounts', // Richiesta per ottenere l'account dell'utente
    });
    }
    
    if (!isLoading && data && !blockchainError) {
      const { web3 } = data; 
      const accounts = await web3.eth.getAccounts();
  
      if (accounts.length > 0) {
        setIsConnected(true); // Imposta lo stato come connesso
        localStorage.setItem("isConnected", "connectedToMeta"); // Memorizza la connessione nel localStorage
      } else {
        console.log("No accounts found. Please connect to MetaMask.");
        setIsConnected(false);
      }
    } else {
      if (isLoading) {
        console.log("Loading blockchain data...");
      }
      if (blockchainError) {
        console.error("Error connecting to blockchain:", blockchainError);
      }
    }
  };

  return (
    <Page title="Product Certification">
      {/* Wallet in alto a destra */}
      {isConnected && <Wallet setConnection={setIsConnected} />}

      {!isConnected && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '10vh',
            marginBottom: '2rem',
          }}
        >
          <Button onClick={handleConnectMeta} variant="solid">
            Connect MetaMask
          </Button>
        </Box>
      )}

      {isConnected && (
        <Box ml={20} mr={20} pb={20}>
            <Typography level="h3" gutterBottom mt={7}>
              Product Certificate Acquisition
            </Typography>
            <Typography sx={{ marginBottom: '1rem', color: '#555' }}>
              Please enter the <strong>engine code</strong> provided with the brake you purchased to verify its authenticity.
            </Typography>
            <Textarea
              placeholder="Enter your engine code here..."
              value={engineCode}
              onChange={(e: any) => setEngineCode(e.target.value)}
              required={true}
              sx={{
                marginBottom: '1rem',
                borderColor: error ? '#ff0000' : '#ced4da',
                '&:focus': {
                  borderColor: '#007bff',
                  boxShadow: '0 0 5px rgba(0, 123, 255, 0.5)',
                },
              }}
            />
            {error && (
              <Typography sx={{ color: '#ff0000', marginBottom: '1rem' }}>
                {error}
              </Typography>
            )}
            <Button
              onClick={handleSearch}
              variant="solid"
              loading={loading}
              sx={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#007bff',
                '&:hover': { backgroundColor: '#0056b3' },
              }}
            >
              Search
            </Button>
            </Box> 
      )}

      <Snackbar
        open={openSnackbar}
        variant="soft"
        autoHideDuration={3000}
        onClose={handleClose}
        color={handleColor()}
        size="lg"
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        {handleBody()}
      </Snackbar>

      {passkey && <Passkey openModal={setOpenPasskey} isModalOpen={passkey} codiceMotore={engineCode} />}
    </Page>
  );
}

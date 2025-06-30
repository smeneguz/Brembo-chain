import { useEffect, useState } from "react";
import { Page } from "../../components/page.component";
import { useNftList } from "./hooks/nft.hook";
import { http } from "../../core/http.core";
import { Box, Button, Table, Typography } from "@mui/joy";
import { Wallet } from "../../components/wallet.component";
import { Download } from '@mui/icons-material'
import GppGoodIcon from '@mui/icons-material/GppGood';
import { useBlockchainConnection } from "./hooks/blockchain.hook";

export function ProductList(){

  const [isConnected, setIsConnected] = useState(false);
  const {data: brakeList, error} = useNftList()
  const { data, loading: isLoading, error: blockchainError, mutate } = useBlockchainConnection();

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

  const handleDownload = async (id: any) =>{
    try {
      // Esegui una richiesta fetch per ottenere il file dall'endpoint
      const response = await http.get(`/brake/downloadXml/${id}`, {
        responseType: 'blob', // Imposta la risposta come blob
      });

      // Crea un URL temporaneo per il blob
      const url = window.URL.createObjectURL(new Blob([response.data]));

      // Crea un elemento <a> per forzare il download
      const link = document.createElement('a');
      link.href = url;

      // Puoi ottenere il nome del file da `Content-Disposition` se il server lo fornisce
      const contentDisposition = response.headers['content-disposition'];
      let fileName = `espe-${id}.xml`; // Nome predefinito del file

      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (fileNameMatch?.[1]) {
          fileName = fileNameMatch[1];
        }
      }

      link.setAttribute('download', fileName); // Nome del file che verrà scaricato

      // Simula il click sul link
      document.body.appendChild(link);
      link.click();

      // Pulisci il link e rimuovi l'URL temporaneo
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error during file download process:', error);
    }
  }

  const handleCertificateDownload = async(codiceMotore: string)=>{
    try {
      // Esegui una richiesta fetch per ottenere il file dall'endpoint
      const response = await http.get(`/brake/downloadCertificate/${codiceMotore}`, {
        responseType: 'blob', // Imposta la risposta come blob
      });

      // Crea un URL temporaneo per il blob
      const url = window.URL.createObjectURL(new Blob([response.data]));

      // Crea un elemento <a> per forzare il download
      const link = document.createElement('a');
      link.href = url;

      // Puoi ottenere il nome del file da `Content-Disposition` se il server lo fornisce
      const contentDisposition = response.headers['content-disposition'];
      let fileName = `certificate-${codiceMotore}.pdf`; // Nome predefinito del file

      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (fileNameMatch?.[1]) {
          fileName = fileNameMatch[1];
        }
      }

      link.setAttribute('download', fileName); // Nome del file che verrà scaricato

      // Simula il click sul link
      document.body.appendChild(link);
      link.click();

      // Pulisci il link e rimuovi l'URL temporaneo
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error during file download process:', error);
    }
  }

  const renderRow = (brake: any) => {
    return (
      <tr key={brake.tokenId}>
        <td 
          style={{
            padding: '10px', 
            textAlign: 'left', 
            whiteSpace: 'normal',  // Consente di andare a capo
            wordWrap: 'break-word', // Impedisce il taglio delle parole lunghe
            maxWidth: '150px' // Imposta una larghezza massima
          }}
        >
          {brake.tokenId}
        </td>
        <td 
          style={{
            padding: '10px', 
            textAlign: 'left', 
            whiteSpace: 'normal', 
            wordWrap: 'break-word', 
            maxWidth: '200px'
          }}
        >
          {brake.codiceMotore}
        </td>
        <td 
          style={{
            padding: '10px', 
            textAlign: 'left', 
            whiteSpace: 'normal', 
            wordWrap: 'break-word', 
            maxWidth: '200px'
          }}
        >
          {brake.consumoEnergia}
        </td>
        <td 
          style={{
            padding: '10px', 
            textAlign: 'left', 
            whiteSpace: 'normal', 
            wordWrap: 'break-word', 
            maxWidth: '200px'
          }}
        >
          {brake.hash}
        </td>
        <td 
          style={{
            padding: '10px', 
            textAlign: 'left', 
            whiteSpace: 'normal', 
            wordWrap: 'break-word', 
            maxWidth: '200px'
          }}
        >
          {brake.createdAt}
        </td>
        <td 
          style={{
            padding: '10px', 
            textAlign: 'left', 
            whiteSpace: 'normal', 
            wordWrap: 'break-word', 
            maxWidth: '150px'
          }}
        >
          {brake.cpd}
        </td>
        <td style={{ padding: '10px', textAlign: 'left' }}>
          <Button startDecorator={<Download />} onClick={() => handleDownload(brake.tokenId)}>
            Download
          </Button>
        </td>
        <td style={{ padding: '10px', textAlign: 'left' }}>
          <Button color="success" onClick={()=> handleCertificateDownload(brake.codiceMotore)} startDecorator={<GppGoodIcon />}>
            Certificate
          </Button>
        </td>
      </tr>
    );
  };

    return(
        <Page title="Products Certificate List" >

        {isConnected && <Wallet setConnection={setIsConnected}/>}
        
        {!isConnected ? (
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
        ) :
        (
          <Box mr={20} ml={20} pb={20}>
          <Typography level="h3" gutterBottom mt={7} mb={3}>
          Acquired Certificates
          </Typography>
          <Table style={{ width: '100%', borderCollapse: 'collapse' }} aria-label="striped table" stripe="odd">
      <thead>
        <tr>
          <th style={{ padding: '10px', backgroundColor: '#f4f4f4', fontWeight: 'bold', 
              textDecoration: 'underline' }}>Token ID</th>
          <th style={{ padding: '10px', backgroundColor: '#f4f4f4', fontWeight: 'bold', 
              textDecoration: 'underline' }}>Codice Motore</th>
          <th style={{ padding: '10px', backgroundColor: '#f4f4f4', fontWeight: 'bold', 
              textDecoration: 'underline' }}>Energy Consumption (Kwh)</th>
          <th style={{ padding: '10px', backgroundColor: '#f4f4f4', fontWeight: 'bold', 
              textDecoration: 'underline' }}>Hash File</th>
          <th style={{ padding: '10px', backgroundColor: '#f4f4f4', fontWeight: 'bold', 
              textDecoration: 'underline' }}>Date</th>
          <th style={{ padding: '10px', backgroundColor: '#f4f4f4', fontWeight: 'bold', 
              textDecoration: 'underline' }}>PFL</th>
          <th style={{ padding: '10px', backgroundColor: '#f4f4f4', fontWeight: 'bold', 
              textDecoration: 'underline' }}>Download</th>
          <th style={{ padding: '10px', backgroundColor: '#f4f4f4', fontWeight: 'bold', 
              textDecoration: 'underline' }}>Certificate</th>
        </tr>
      </thead>
      <tbody>
        {!error && brakeList && brakeList.map(renderRow)}
      </tbody>
    </Table>
    </Box>
      )}
       </Page>
    )
        
}
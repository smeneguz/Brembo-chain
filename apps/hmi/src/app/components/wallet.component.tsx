import { useEffect, useState } from "react";
import {useBlockchainConnection} from "../features/product/hooks/blockchain.hook"
import { Box, Button, Card, Typography } from "@mui/joy";
import Avatar from "boring-avatars";

type Connection = {
 setConnection: (open: boolean) => void;
}

export function Wallet({setConnection}: Connection){
   
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [balance, setBalance] = useState<string | null>(null);
    const { data: blockchainUserInformation, error } = useBlockchainConnection();

    const connectToMetamask = async () => {
        if (window.ethereum) {
          try {
            
            await window.ethereum.request({ method: 'eth_requestAccounts' }); 
          
            const accounts = await blockchainUserInformation!.web3.eth.getAccounts();
            const balanceWei = await blockchainUserInformation!.web3.eth.getBalance(accounts[0]);
            const balanceEther = blockchainUserInformation!.web3.utils.fromWei(balanceWei, 'ether');
    
            setWalletAddress(accounts[0]);
            setBalance(balanceEther);
          } catch (error) {
            console.error('User rejected request', error);
          }
        } else {
          alert('Please install MetaMask!');
        }
      };

      const handleDisconnection = async () =>{
        localStorage.removeItem("isConnected")
        setConnection(false)
      }

      useEffect( ()=>{
        connectToMetamask() 
      })

      return(
        
        <Box sx={{ textAlign: 'right' }} mt={6} mr={20}>
            <Card sx={{ 
                display: 'inline-block',  
                maxWidth: 'fit-content',   
                padding: 2,
                backgroundColor: '#e6f7ff',
                borderRadius: '16px', // Arrotonda gli angoli
                boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', // Ombra più leggera e piacevole
                border: '1px solid #0e0e0', // Aggiunge un bordo sottile per definizione
                transition: 'transform 0.2s ease, box-shadow 0.2s ease', // Effetto animato
                  '&:hover': { 
                    transform: 'translateY(-4px)', // Leggero sollevamento al passaggio del mouse
                    boxShadow: '0px 8px 12px rgba(0, 0, 0, 0.2)', // Ombra più marcata in hover
                  }                    
            }}>
            <Box sx={{ 
                display: 'flex',          
                alignItems: 'center',     
                justifyContent: 'flex-end' 
            }}>
                <Avatar name={walletAddress! || ""} size={32} sx={{ marginRight: 1 }} />
                <Typography ml={2}>{walletAddress}</Typography>
            </Box>
            <Typography >Balance: {balance} ETH</Typography>
            <Button onClick={handleDisconnection} sx={{mt: 2}}>Disconnection</Button>
            </Card>
          </Box>
      )
}
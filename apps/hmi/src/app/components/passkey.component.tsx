import { Button, DialogContent, DialogTitle, FormControl, FormLabel, Input, Modal, ModalClose, ModalDialog, Snackbar, Stack } from "@mui/joy";
import { http } from "../core/http.core";
import { useState } from "react";
import { useBlockchainConnection } from "../features/product/hooks/blockchain.hook";

type ChildComponentProps = {
    openModal: (open: boolean) => void;
    isModalOpen: boolean;
    codiceMotore: string;
  };

export function Passkey({openModal, isModalOpen, codiceMotore}: ChildComponentProps){
    const [passkey, setPasskey] = useState<string | null>(null)
    const [error, setError] = useState<boolean>(false)
    const [response, setResponse] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)
    const [resultContent, setResultContent] = useState<string | null>(null)
    
    const { data: blockchainUserInformation, error: errorBlk } = useBlockchainConnection();
    
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        try{
            setLoading(true)
           event.preventDefault();
            const accounts = await blockchainUserInformation!.web3.eth.getAccounts();
            await http.post(`/brake/${codiceMotore}`, {
                brakeDto: {
                    passkey: passkey, address: accounts[0]
                }
            },)
            setError(false)
            setTimeout(() =>{
                setResponse(true)
                setLoading(false)
                setTimeout(()=>{
                    openModal(false)
                }, 6000)
            }, 12000)
            //openModal(false); 
        }catch(err: any){
            setError(true)
            setLoading(false)
            setResultContent(err.response.data.message)
        }
    }

    return(
        <>
        <Modal open={isModalOpen} onClose={()=> openModal(false)}>
            <ModalDialog
                size="lg"
                variant="outlined">
                    <DialogTitle>NFT Acquisition</DialogTitle>
                    <DialogContent>Enter the passkey you were given when you purchased the brake in order to acquire the NFT associated with the brake</DialogContent>
                    <form 
                        onSubmit={handleSubmit}>
                        <Stack spacing={2}>
                            <FormControl>
                                <FormLabel>Passkey</FormLabel>
                                <Input autoFocus required onChange={(e) => {setPasskey(e.target.value)}} placeholder="Insert the passkey..."/>
                            </FormControl>
                            <Button type="submit" loading={loading}>Submit</Button>
                        </Stack>
                    </form>
            <ModalClose />
            </ModalDialog>
            
        </Modal>
        <Snackbar open={error || response} onClose={()=>{setError(false); setResponse(false)}} color={error ? "danger" : "success"} variant="soft" anchorOrigin={{vertical: "top", horizontal: "center"}} size="lg">{resultContent || "NFT trasferito correttamente all'account"}</Snackbar> 
        </>
    )
}
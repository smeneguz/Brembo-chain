import { Button, DialogContent, DialogTitle, Input, Modal, ModalClose, ModalDialog } from "@mui/joy";
import LinearProgressWithLabel from "./progressbar.component";
import { useState } from "react";
import { http } from "../core/http.core";
import { useCurrentUser } from "../hooks/use-current-user.hook";
import { toast } from "sonner";

type VerifyProps = {
	process: string //rotor, stator, assembly, espe
	idProcess: number
    idProcessPhase?: number //solo nel caso in cui process sia: stator | rotor | assembly -> per espe solo idProcess
    onClose: () => void
}

export default function VerifyXml({process, idProcess, idProcessPhase, onClose}: VerifyProps) {
    const [modalVerify, setVerify] = useState(true)
	const [currentXmlFile, setCurrentXmlFile] = useState<File>();
	const [loadingBar, setLoadingBar] = useState(false)
	const [verificationResult, setVerificationResult] = useState(false)
	const [verificationPositive, setVerificationPositive] = useState(false)
	const [currentUser] = useCurrentUser()

    async function handleCloseModal(){
		setVerify(false)
		setLoadingBar(false)
		setVerificationResult(false)
        onClose()
	}

    function sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

    async function handleFileVerification(event: React.FormEvent<HTMLFormElement>){
		event.preventDefault()
		try{
			//setVerify(false)
			console.log(currentUser)
			if(currentUser.profile.role != "admin" && currentUser.profile.role != "manager" ){
				throw new Error("You do not have the required role to perform this operation!")
			}
			setLoadingBar(true)
			const formData = new FormData()
			formData.append("xmlFile", currentXmlFile!)
			const config = {
				headers: {
				  'content-type': 'multipart/form-data',
				},
			  };
			await sleep(2500) //la progress bar cresce linearmente senza una logica precisa fino al 100%
            let url
            switch(process){
                case "stator": {
                    url = `/stator/${idProcess}/${idProcessPhase}/verify`
                    break;
                }
                case "rotor": {
                    url = `/rotor/${idProcess}/${idProcessPhase}/verify`
                    break;
                }
                case "assembly": {
                    url = `/assembly/${idProcess}/${idProcessPhase}/verify`
                    break;
                }
                case "espe": {
                    url = `/espe/${idProcess}/verify`
                    break;
                }
                default: {
                    throw new Error(`process: ${process} is not acceptable`)
                }
            }
			const response = await http.post(url, formData, config)
			setVerificationResult(true)
			response.data == true ? setVerificationPositive(true) : setVerificationPositive(false)
		}catch(err: any){
			toast.error(err.message)
			await handleCloseModal()
			throw new Error(err.message)
		}
	}

    async function handleChangeFile(event: React.ChangeEvent<HTMLInputElement>){
		event.preventDefault()
		setCurrentXmlFile(event.target.files?.[0]);
	}
    
    return(
        <Modal open={modalVerify} onClose={handleCloseModal}>
				{!loadingBar ?
					<ModalDialog color="danger"
						layout="center"
						size="md"
						variant="plain">
						<ModalClose />
						<DialogTitle>Uploading XML file</DialogTitle>
						<DialogContent>Insert the file you want to verify</DialogContent>
							<form onSubmit={handleFileVerification}>
							<Input type="file" onChange={handleChangeFile}/>
							<Button fullWidth sx={{marginTop: 2}} color="primary" type='submit'>
								Verify
							</Button>
							</form>
					</ModalDialog> : 
					<>
					{ !verificationResult ?
						<ModalDialog color="danger"
							layout="center"
							size="md"
							variant="plain">
							<DialogTitle>Verification in progress</DialogTitle>
							<DialogContent>Checking the hash of the file against the one saved on Blockchain in progress.</DialogContent>
							<DialogContent>Please wait...</DialogContent>
							<LinearProgressWithLabel />
						</ModalDialog> :
						<ModalDialog color="danger"
							layout="center"
							size="md"
							variant="plain">
							<ModalClose />
							<DialogTitle>Verification completed!</DialogTitle>
								{ verificationPositive ?
									<>
												<DialogContent>
													<img src='/icons/ready.png' width={150} height={150} style={{textAlign: "center", display: "block", margin: "auto", marginTop: 30}}></img>
												</DialogContent>
												<DialogContent sx={{marginTop: 2}}>Verification with positive result. The File matches the one saved on the Blockchain!</DialogContent>
									</>
									:
									<>	
												<DialogContent>
													<img src='/icons/remove.png' width={150} height={150} style={{textAlign: "center", display: "block", margin: "auto", marginTop: 30}}></img>							
												</DialogContent>
												<DialogContent sx={{marginTop: 2}}>Verification with negative result. The File does NOT match the one saved on the Blockchain!</DialogContent>
									</>
								}
						</ModalDialog>
					}</>
				}
			</Modal>
    )
}
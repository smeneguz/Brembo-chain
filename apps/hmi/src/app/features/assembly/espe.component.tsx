import { Button, Modal, ModalDialog, ModalClose, DialogTitle, DialogContent, Input, Grid } from '@mui/joy'
import { Page } from '../../components/page.component'
import { Add, OpenInNew, Download, Verified } from '@mui/icons-material'
import { useEspeList } from './hooks/use-espe-list.hook'
import { SmartTable } from '@polaritybit/smart-table'
import React, { ChangeEvent, useMemo, useState } from 'react'
import { TableColumn } from '@polaritybit/smart-table/dist/lib/smart-table.component'
import { useAppDispatch } from '../../store/store'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { http } from '../../core/http.core'
import { addLoader, removeLoader } from '../../store/loading.store'
import classes from '../../styles/table.module.scss'
import VerifyXml from '../../components/verifyXml.component'

function useEspe(searchText: string): { espeData: any[]; isLoading: boolean; error: any; onRefresh: () => void } {
	const { data, isLoading, error, onRefresh } = useEspeList()

	const espeData = useMemo(() => {
		if (data === undefined) {
			return []
		}

		if (!searchText) {
			return data
		}

		const lowercaseSearchText = searchText?.toLowerCase() ?? ''

		return data.filter((item: any) => {
			const dateFirst = new Date(item.createdAt)
			const dateLast = new Date(item.updatedAt)
			if (
				(''+dateFirst.getFullYear()+'/'+String(dateFirst.getMonth()+1).padStart(2,'0')+'/'+String(dateFirst.getDay()).padStart(2,'0')+' '+String(dateFirst.getHours()).padStart(2,'0')+':'+String(dateFirst.getMinutes()).padStart(2,'0')+':'+String(dateFirst.getSeconds()).padStart(2,'0')).includes(lowercaseSearchText) ||
				(''+dateLast.getFullYear()+'/'+String(dateLast.getMonth()+1).padStart(2,'0')+'/'+String(dateLast.getDay()).padStart(2,'0')+' '+String(dateLast.getHours()).padStart(2,'0')+':'+String(dateLast.getMinutes()).padStart(2,'0')+':'+String(dateLast.getSeconds()).padStart(2,'0')).includes(lowercaseSearchText) ||
				item.cpd == lowercaseSearchText ||
				item.tokenId == parseInt(lowercaseSearchText) ||
				item.id == parseInt(lowercaseSearchText)
			) {
				return item
			}
		})
	}, [data, searchText])

	return {
		espeData,
		error,
		isLoading,
		onRefresh,
	}
}

export function EspePage() {
	let [searchText, updateSearch] = useState('')
	const { espeData: espeItems, onRefresh } = useEspe(searchText)
	const dispatch = useAppDispatch()
	const navigate = useNavigate()
	const [modalVerify, setShowVerify] = useState(false)
	const [itemSelected, setItemSelected] = useState()
	const [newEspe, setNewEspe] = useState(false)
	const [cpd_value, setCpdValue] = useState("")

	const handleCloseVerify = () =>{
		setShowVerify(false)
	}

	const espeColumns = useMemo(() => {
		return [
			{
				key: 'id',
				title: 'ID',
				getValue(item: any){
					return item.id
				}
			},
			{
				key: 'pfc',
				title: 'PFC',
				getValue(item: any){
					return item.cpd
				}
			},
			{ 
				key: 'tokenId', 
				title: 'Token ID',
				getValue(item: any){
					return item.tokenId || 'undefined'
				}
			},
			{
				key: 'referenceAssembly',
				title: 'Motor Reference',
				cellClassName: classes.content,
				getValue(item: any){
					return item.codiceMotore || 'undefined'
				}
			},
			{
				key: 'blockchainStatus',
				title: 'Blockchain Status',
				cellClassName: classes.content,
				getValue(item: any){
					if(item.tokenId){
						return <img src='/icons/ready.png' alt="checked" width="20" height="20" ></img>
					} else {
						return <img src='/icons/remove.png' alt="removed" width="20" height="20" ></img>
					}
				}
			},
			{
				key: 'createdAt',
				title: 'Creation Date',
				getValue(item: any){
					const date = new Date(item.createdAt)
					return ''+date.getFullYear()+'/'+String(date.getMonth()+1).padStart(2,'0')+'/'+String(date.getDay()).padStart(2,'0')+' '+String(date.getHours()).padStart(2,'0')+':'+String(date.getMinutes()).padStart(2,'0')+':'+String(date.getSeconds()).padStart(2,'0')
				}
			},
			{
				key: 'updatedAt',
				title: 'Last Update',
				getValue(item: any){
					const date = new Date(item.updatedAt)
					return ''+date.getFullYear()+'/'+String(date.getMonth()+1).padStart(2,'0')+'/'+String(date.getDay()).padStart(2,'0')+' '+String(date.getHours()).padStart(2,'0')+':'+String(date.getMinutes()).padStart(2,'0')+':'+String(date.getSeconds()).padStart(2,'0')
				}
			},
			{
				key: 'actions',
				title: '',
				getValue(item) {
					function handleOpenItem() {
						navigate(`/espe/view/${item.id}`)
					}

					return (
						<Button size="sm" variant="soft" color="primary" onClick={handleOpenItem}>
							<OpenInNew sx={{ marginRight: 1 }} /> Open
						</Button>
					)
				},
			},
			{
				key: 'downloadFile',
				title: 'XML File',
				getValue(item: any){
					async function handleDownload(){
						try{
							const res = await http.get(`espe/${item.id}/downloadXml`)
							// Estrai il nome del file dal Content-Disposition header
							const contentDispositionHeader = res.headers['content-disposition'];
							const match = contentDispositionHeader && contentDispositionHeader.match(/filename="(.+?)"/);
							const fileName = match ? match[1] : `espe${item.id}.xml`;
					
							// Crea un oggetto Blob dallo stream restituito dal server
							const blob = new Blob([res.data], { type: res.headers['content-type'] });
					
							// Crea un URL temporaneo e creazione di un link temporaneo
							const url = window.URL.createObjectURL(blob);
							const a = document.createElement('a');
							a.href = url;
							a.download = fileName;
					
							// Simula il clic per avviare il download
							document.body.appendChild(a);
							a.click();
							document.body.removeChild(a);
						} catch(err: any){
							throw new Error(err.message)
						}
					}
					return (
						<Button size="sm" variant="soft" color="danger" disabled={item.tokenId == null} onClick={handleDownload}>
							<Download sx={{ marginRight: 1}} /> Download
						</Button>
					) 	
				}
			},
			{
				key: 'verifyXmlFile',
				title: 'XML Verification',
				getValue(item: any){
				return(
					<Button size="sm" variant="soft" color="success" disabled={item.tokenId == null} onClick={()=>{setShowVerify(true); setItemSelected(item.id)}}>
						<Verified sx={{ marginRight: 1}}/> Verify
					</Button>
				)
			}
			
		}
		] as TableColumn[]
	}, [])

	async function handleCreateEspe(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setNewEspe(false)
		try {
			dispatch(addLoader('createEspe'))
			await http.post(`/espe/new/${cpd_value}`)
			toast.success('Component Clipper-Motor successfully created!')
			onRefresh()
		} catch (error: any) {
			console.log(error)
			toast.error(error.response.data.message)
		} finally {
			dispatch(removeLoader('createEspe'))
		}
	}

	function handleSearchBarFormSubmit(event: ChangeEvent<HTMLFormElement>) {
		event.preventDefault()
		const input = event.target.elements.namedItem('search') as HTMLInputElement
		updateSearch(input.value)
	}


	return (
		<Page
			title="Clipper-Motor Assembly"
			actions={
				<Button size="sm" onClick={()=>setNewEspe(true)}>
					<Add sx={{ marginRight: 1 }} /> Create New
				</Button>
			}
		>
			<form onSubmit={handleSearchBarFormSubmit}>
				<Grid container spacing={2}>
					<Grid>
						<Input fullWidth name="search" variant="outlined" placeholder="Search..." />
					</Grid>
					<Grid>
						<Button type="submit">Search</Button>
					</Grid>
				</Grid>
			</form>
			{modalVerify && <VerifyXml process='espe' idProcess={parseInt(itemSelected!)} onClose={handleCloseVerify}/>}	
			<SmartTable items={espeItems} columns={espeColumns} getItemKey={(item: any) => item.id} />
			<Modal open={newEspe} onClose={()=>setNewEspe(false)}>
				<form onSubmit={handleCreateEspe}>
				<ModalDialog color="danger"
						layout="center"
						size="md"
						variant="plain">
				<ModalClose />
				<DialogTitle>Create new Clipper-Motor component</DialogTitle>
				<DialogContent>Enter the unique PFC code to be associated with the new Clamp-Motor component that is being created</DialogContent>
				<Input placeholder="codice PFC" variant='outlined' color='primary' defaultValue={cpd_value} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCpdValue(e.target.value)} required/>
				<Button type='submit'>Create component</Button>
				</ModalDialog>
				</form>
			</Modal>
		</Page>
	)
}

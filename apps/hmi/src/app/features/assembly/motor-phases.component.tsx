import { useMemo, useState } from 'react'
import { Page } from '../../components/page.component'
import { SmartTable } from '@polaritybit/smart-table'
import { TableColumn } from '@polaritybit/smart-table/dist/lib/smart-table.component'
import classes from '../../styles/table.module.scss'
import { useParams } from 'react-router-dom'
import { useMotorPhasesList } from './hooks/use-motor-list.hook'
import { http } from '../../core/http.core'
import { Button } from '@mui/joy'
import { Download, Verified } from '@mui/icons-material'
import VerifyXml from '../../components/verifyXml.component'

export function MotorPhases() {
	const { id } = useParams()
	const {data} = useMotorPhasesList(+id!)
	const [showVerify, setShowVerify] = useState(false)
	const [itemId, setItemId] = useState()

	const handleCloseVerify = () =>{
		setShowVerify(false)
	}
	
	const columns: TableColumn[] = useMemo(() => {
		return [
			{
				key: 'id',
				title: 'ID',
				headerClassName: classes.sortable,
				getValue(item) {
					return item.id
				},
				getSortProperty(item: any) {
					return item.id
				},
			},
			{
				key: 'stazioneDiLavorazione',
				title: 'Processing Station',
				headerClassName: classes.sortable,
				cellClassName: classes.content,
				getValue(item: any) {
					return <strong>{item.stazioneDiLavorazione}</strong>
				},
				getSortProperty(item: any) {
					return item.stazioneDiLavorazione
				}
			},
			{
				key: 'consumoEnergiaMotore',
				title: 'Motor Energy Consumption',
				headerClassName: classes.sortable,
				cellClassName: classes.content,
				getValue(item: any) {
					return item.consumeEnergiaMotore
				},
				getSortProperty(item: any) {
					return item.consumeEnergiaMotore
				},
				
			},
            {
				key: 'statoComponente',
				title: 'Component Status',
				cellClassName: classes.content,
				getValue(item: any) {
					return item.statoComponente
				},
			},
			{
				key: 'dataInizioProcesso',
				title: 'Start of Process',
				cellClassName: classes.content,
				getValue(item: any) {
					const date = new Date(item.dataInizioProcesso)
					return ''+date.getFullYear()+'/'+String(date.getMonth()+1).padStart(2,'0')+'/'+String(date.getDate()).padStart(2,'0')+' '+String(date.getHours()).padStart(2,'0')+':'+String(date.getMinutes()).padStart(2,'0')+':'+String(date.getSeconds()).padStart(2,'0')
				},
			},
			{
				key: 'dataFineProcesso',
				title: 'End of Process',
				cellClassName: classes.content,
				getValue(item: any) {
					if(item.dataFineProcesso != null){
						const date = new Date(item.dataFineProcesso)
						return ''+date.getFullYear()+'/'+String(date.getMonth()+1).padStart(2,'0')+'/'+String(date.getDate()).padStart(2,'0')+' '+String(date.getHours()).padStart(2,'0')+':'+String(date.getMinutes()).padStart(2,'0')+':'+String(date.getSeconds()).padStart(2,'0')
					}
					return ''
				},
			},
            {
				key: 'codiceFlangia',
				title: 'Flange Code',
				cellClassName: classes.content,
				getValue(item: any) {
					return item.codiceFlangia
				},
			},
            {
				key: 'lottoScrew',
				title: 'Lot Screw',
				cellClassName: classes.content,
				getValue(item: any) {
					return item.lottoScrew
				},
			},
			{
				key: 'lottoOR',
				title: 'Lot OR',
				cellClassName: classes.content,
				getValue(item: any) {
					return item.lottoOR
				},
			},
			{
				key: 'downloadFile',
				title: 'XML File',
				getValue(item: any){
					async function handleDownload(){
						try{
							const res = await http.get(`assembly/${id}/${item.id}/downloadXml`)
							// Estrai il nome del file dal Content-Disposition header
							const contentDispositionHeader = res.headers['content-disposition'];
							const match = contentDispositionHeader && contentDispositionHeader.match(/filename="(.+?)"/);
							const fileName = match ? match[1] : `assembly_${item.stazioneDiLavorazione}_${item.id}.xml`;
					
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
						<Button size="sm" variant="soft" color="danger" onClick={handleDownload}>
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
					<Button size="sm" variant="soft" color="success" onClick={()=>{setShowVerify(true), setItemId(item.id)}}>
						<Verified sx={{ marginRight: 1}}/> Verify
					</Button>
				)
			}
			
		}
		] as TableColumn[]
	}, [])
	
	return (
		<Page title="Motor Phases">
			<SmartTable
				columns={columns}
				items={data}
				getItemKey={(item: any) => item.id}
				parseDatasetValue={(item: any) => +item.id}
			/>
			{showVerify && <VerifyXml process='assembly' idProcess={parseInt(id!)} idProcessPhase={parseInt(itemId!)} onClose={handleCloseVerify}/>}	
		</Page>
	)
}
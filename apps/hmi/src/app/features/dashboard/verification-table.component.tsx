import { SmartTable } from '@polaritybit/smart-table'
import { TableColumn } from '@polaritybit/smart-table/dist/lib/smart-table.component'
import { useMemo } from 'react'
import classes from '../../styles/table.module.scss'
import { useVerificationInfo } from './hooks/use-verification-info.hook'

type VerificationInformation = {
	verification: boolean
}

export function VerificationTable({verification}: VerificationInformation) {
    const {data: verificationInfo} = useVerificationInfo(verification)

    const columns: TableColumn[] = useMemo(() => {
		return [
			{
				key: 'id',
				title: 'ID',
				getValue(item: any) {
					return item.id
				}
			},
			{
				key: 'hashToVerify',
				title: 'Hash',
				cellClassName: classes.content,
				getValue(item: any) {
					return item.hashToVerify
				}
			},
			{
				key: 'process',
				title: 'Process',
				cellClassName: classes.content,
				getValue(item: any) {
					return item.process
				}
			},
			{
				key: 'date',
				title: 'Date',
				cellClassName: classes.content,
				getValue(item: any) {
					return item.verificationDate
				}
			}
		]as TableColumn[]
        }, [])
            
    return(
        <SmartTable
			columns={columns}
			items={verificationInfo}
			getItemKey={(item: any) => item.id}
			parseDatasetValue={(item: any) => +item.id}
		/>
    )
}
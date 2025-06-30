import { SmartTable } from '@polaritybit/smart-table'
import { TableColumn } from '@polaritybit/smart-table/dist/lib/smart-table.component'
import { useMemo } from 'react'
import { useTxAmountList } from './hooks/use-txamount-list.hook'
import classes from '../../styles/table.module.scss'

type PointInformation = {
	data: any
}

export function TransactionTable({data}: PointInformation) {
    const {data: txList} = useTxAmountList(data.data.x)

    const columns: TableColumn[] = useMemo(() => {
		return [
			{
				key: 'blockNumber',
				title: 'Block Number',
				getValue(item) {
					return item.blockNumber
				}
			},
			{
				key: 'from',
				title: 'Sender Address',
				cellClassName: classes.content,
				getValue(item: any) {
					return item.from
				}
			},
			{
				key: 'to',
				title: 'Receiver Address',
				cellClassName: classes.content,
				getValue(item: any) {
					return item.to
				}
			},
			{
				key: 'hash',
				title: 'Transaction Hash',
				cellClassName: classes.content,
				getValue(item: any) {
					return item.hash
				}
			}
		]as TableColumn[]
        }, [])
            
    return(
        <SmartTable
			columns={columns}
			items={txList}
			getItemKey={(item: any) => item.id}
			parseDatasetValue={(item: any) => +item.id}
		/>
    )
}
import { ChangeEvent, useMemo, useState } from 'react'
import { Page } from '../../components/page.component'
import { SmartTable } from '@polaritybit/smart-table'
import { TableColumn } from '@polaritybit/smart-table/dist/lib/smart-table.component'
import classes from '../../styles/table.module.scss'
import { useNavigate } from 'react-router-dom'
import { Button, Grid, Input } from '@mui/joy'
import { OpenInNew } from '@mui/icons-material'
import { useMotorList } from './hooks/use-motor.hook'

function useMotor(searchText: string): { motorData: any[]; isLoading: boolean; error: any; onRefresh: () => void } {
	const { data, isLoading, error, onRefresh } = useMotorList()

	const motorData = useMemo(() => {
		if (data === undefined) {
			return []
		}

		if (!searchText) {
			return data
		}

		const lowercaseSearchText = searchText?.toLowerCase() ?? ''

		return data.filter((item: any) => {
			if (
				item.codiceMotore?.toLowerCase().includes(lowercaseSearchText) ||
				item.tokenId == parseInt(lowercaseSearchText) ||
				item.id == parseInt(lowercaseSearchText)
			) {
				return item
			}
		})
	}, [data, searchText])

	return {
		motorData,
		error,
		isLoading,
		onRefresh,
	}
}

export function Motors() {
	let [searchText, updateSearch] = useState('')
	const { motorData } = useMotor(searchText)
	const navigate = useNavigate()
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
				key: 'codiceMotore',
				title: 'Motor Code',
				headerClassName: classes.sortable,
				getValue(item: any) {
					return <strong>{item.codiceMotore}</strong>
				},
				getSortProperty(item: any) {
					return item.codiceMotore
				},
			},
			{
				key: 'tokenId',
				title: 'Token ID',
				headerClassName: classes.sortable,
				getValue(item: any) {
					return item.tokenId
				},
				getSortProperty(item: any) {
					return item.tokenId
				},
			},
			{
				key: 'stato',
				title: 'Status',
				getValue(item: any) {
					return item.stato
				},
			},
			{
				key: 'actions',
				title: '',
				getValue(item) {
					function handleOpenItem() {
						navigate(`/motor/view/${item.id}`)
					}

					return (
						<Button size="sm" variant="soft" color="primary" onClick={handleOpenItem}>
							<OpenInNew sx={{ marginRight: 1 }} /> Open
						</Button>
					)
				},
			},
		] as TableColumn[]
	}, [])

	function handleSearchBarFormSubmit(event: ChangeEvent<HTMLFormElement>) {
		event.preventDefault()
		const input = event.target.elements.namedItem('search') as HTMLInputElement
		updateSearch(input.value)
	}
	
	return (
		<Page title="Motor">
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
			<SmartTable
				key={searchText}
				columns={columns}
				items={motorData}
				getItemKey={(item: any) => item.id}
				parseDatasetValue={(item: any) => +item.id}
			/>
		</Page>
	)
}
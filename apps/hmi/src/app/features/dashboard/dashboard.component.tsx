import { Box, Card, CardContent, Grid, Tooltip, Typography } from '@mui/joy'
import { Page } from '../../components/page.component'
import { useStatorList } from '../assembly/hooks/use-stator.hook'
import { useRotorList } from '../assembly/hooks/use-rotor.hook'
import { useMotorList } from '../assembly/hooks/use-motor.hook'
import { useEspeList } from '../assembly/hooks/use-espe-list.hook'
import { PieChart } from './pie-chart.component'
import { LineChart } from './line-chart.component'
import { useVerification } from './hooks/use-verification.hook'
import { useTxAmount } from './hooks/use-txamount.hook'
import { useState } from 'react'
import { TransactionTable } from './transaction-table.component'
import { useNavigate } from 'react-router-dom'
import classes from '../../styles/dashboard.module.scss'
import { VerificationTable } from './verification-table.component'
import {InfoRounded} from '@mui/icons-material'

type DashboardCounterItemProps = {
	title: string
	value: number
	link: string
}

function DashboardCounterItem({ title, value, link }: DashboardCounterItemProps) {
	const navigate = useNavigate()
	return (
		<Grid xs={3}>
				<Card onClick={()=>navigate(`${link}`)} className={classes.card}>
					<CardContent>
						<Typography level="h4" textAlign="center">
							{title}
						</Typography>
					</CardContent>
					<CardContent>
						<Typography level="h1" textAlign="center">
							{value}
						</Typography>
					</CardContent>
				</Card>
		</Grid>
	)
}


export function Dashboard() {
	const { data: stators } = useStatorList()
	const { data: rotors } = useRotorList()
	const { data: motors } = useMotorList()
	const { data: espe } = useEspeList()
	const {data: verification} = useVerification()
	const {data: txamount} = useTxAmount()
	const [pointInfo, setPoinInfo] = useState<any>({})
	const [verificationBool, setVerificationInfo] = useState(true)


	const handlePointClick=(point: any)=>{
		setPoinInfo(point)
	}

	const handleVerificationClick=(verification: any)=>{
		verification.data.id == "failed_verifications" ?
			setVerificationInfo(false) 
			:
			setVerificationInfo(true);
	}

	return (
		<Page title="Dashboard">
			<Grid container spacing={2}>
				<DashboardCounterItem title="Stators" value={stators?.length ?? 0} link="/stators"/>
				<DashboardCounterItem title="Subsystem Flanges" value={rotors?.length ?? 0} link="/rotors"/>
				<DashboardCounterItem title="Motors" value={motors?.length ?? 0} link="/motors"/>
				<DashboardCounterItem title="Clipper-Motor Assemblies" value={espe?.length ?? 0} link="/espe"/>
			</Grid>
			<Grid container spacing={2}>
				<Grid xs={6}>
					<Card>
						<Typography level="h4" textAlign="center">
							Verifications
						</Typography>
						<CardContent>
							<Box sx={{ height: 300 }}>
								<PieChart data={[
											{
												id: 'failed_verifications',
												label: 'Failed Verifications',
												value: verification ? verification.failed : 0,
												color: '#e30',
											},
											{
												id: 'successful_verifications',
												label: 'Successful Verifications',
												value: verification ? verification.success : 0,
												color: '#0e9',
											},
								]} handleVerificationClick={handleVerificationClick}/>
							</Box>
						</CardContent>
					</Card>
				</Grid>
				<Grid xs={6}>
					<Card>
					<Box display="flex" justifyContent="space-between" alignItems="center">
						<Typography level="h4" style={{ margin: 'auto' }}>
							Transactions
						</Typography>
						<Tooltip title="Click on diagram point to list Blockchain transactions on the selected date">
						<InfoRounded />
						</Tooltip>
					</Box>
						<CardContent>
							<Box sx={{ height: 300 }}>
								{txamount ? 
								<LineChart data={[{
										id: 'txs',
										color: '#09e',
										data: Object.entries(txamount).map(([key, value]) => ({
											x: key,
											y: value
										  })),
									}]} handlePointClick={handlePointClick}/>
									:
									<></>
								}
							</Box>
						</CardContent>
					</Card>
				</Grid>
			</Grid>
			<Grid container spacing={2}>
				<Grid xs={6}>
					<Card className={classes.table}> 
						<Typography level="h4" textAlign="center">
						 {verificationBool ? "Successful " : "Failed "} Verification List
						</Typography>
						<CardContent>
							<VerificationTable verification={verificationBool}/>
						</CardContent>
					</Card>
				</Grid>
				<Grid xs={6}>
					{pointInfo && pointInfo.data ? 
					<Card className={classes.table}>
						<Typography level="h4" textAlign="center">
							Transaction List on {pointInfo.data.x}
						</Typography>
						<CardContent>
							<TransactionTable data={pointInfo} />
						</CardContent>
					</Card>
					:
					<></>
					}
				</Grid>
			</Grid>
		</Page>
	)
}

import { Card, CardContent } from '@mui/joy'
import { ResponsivePie } from '@nivo/pie'

type PieChartProps = {
	data: any
	handleVerificationClick: (state: any)=>void
}

export function PieChart({ data, handleVerificationClick }: PieChartProps) {
	return (
		<ResponsivePie
			data={data}
			onClick={handleVerificationClick}
			margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
			innerRadius={0.5}
			padAngle={0.7}
			cornerRadius={0}
			activeOuterRadiusOffset={8}
			borderWidth={1}
			tooltip={({ datum }) => (
				<Card>
					<CardContent orientation="horizontal">
						<strong>{datum.label}</strong> {datum.value}
					</CardContent>
				</Card>
			)}
			arcLinkLabelsSkipAngle={10}
			arcLinkLabelsTextColor="#333333"
			arcLinkLabelsThickness={2}
			arcLinkLabelsColor={{ from: 'color' }}
			arcLabelsSkipAngle={0}
			arcLabelsTextColor={{
				from: 'color',
				modifiers: [['darker', 2]],
			}}
			arcLinkLabel={(d) => `${d.label}`}
			colors={{ datum: 'data.color' }}
			legends={[
				{
					anchor: 'bottom',
					direction: 'row',
					justify: false,
					translateX: 0,
					translateY: 56,
					itemsSpacing: 0,
					itemWidth: 100,
					itemHeight: 18,
					itemTextColor: '#999',
					itemDirection: 'left-to-right',
					itemOpacity: 1,
					symbolSize: 18,
					symbolShape: 'circle',
					effects: [
						{
							on: 'hover',
							style: {
								itemTextColor: '#000',
							},
						},
					],
				},
			]}
		/>
	)
}

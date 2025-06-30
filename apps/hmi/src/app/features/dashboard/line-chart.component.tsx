import { ResponsiveLine } from '@nivo/line'

type LineChartProps = {
	data: Array<any>,
	handlePointClick: (point: any)=>void
}

export function LineChart({ data, handlePointClick }: LineChartProps) {
	
	return (
		<ResponsiveLine
			data={data}
			margin={{ top: 50, right: 50, bottom: 50, left: 60 }}
			xScale={{ type: 'point' }}
			yScale={{
				type: 'linear',
				min: 0,
				max: 100,
				stacked: true,
				reverse: false,
			}}
			yFormat=" >-0d"
			axisTop={null}
			axisRight={null}
			axisBottom={{
				tickSize: 5,
				tickPadding: 5,
				tickRotation: 0,
				legend: 'Data',
				legendOffset: 36,
				legendPosition: 'middle',
				truncateTickAt: 0,
			}}
			axisLeft={{
				tickSize: 5,
				tickPadding: 5,
				tickRotation: 0,
				legend: 'Transactions',
				legendOffset: -40,
				legendPosition: 'middle',
				truncateTickAt: 0,
			}}
			pointSize={10}
			pointColor={{ theme: 'background' }}
			pointBorderWidth={2}
			pointBorderColor={{ from: 'serieColor' }}
			pointLabelYOffset={-12}
			useMesh={true}
			onClick={handlePointClick}
		/>
	)
}

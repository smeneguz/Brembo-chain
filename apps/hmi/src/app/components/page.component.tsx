import { Divider, Grid, Sheet, Typography } from '@mui/joy'

type PageProps = {
	title: string
	actions?: React.ReactNode
	children: React.ReactNode
}

export function Page({ title, actions, children }: PageProps) {
	return (
		<Sheet sx={{ width: '100%' }}>
			<Grid container spacing={2} alignItems="center" sx={{ marginBottom: 1 }}>
				<Grid xs={8}>
					<Typography level="h3">{title}</Typography>
				</Grid>
				<Grid xs={4} sx={{ textAlign: 'right' }}>
					{actions}
				</Grid>
			</Grid>
			<Divider />
			<Sheet sx={{ mt: 2 }}>{children}</Sheet>
		</Sheet>
	)
}

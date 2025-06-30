import { Box } from '@mui/joy'
import { PropsWithChildren } from 'react'
import { StyleContainer } from '../app.types'

export function Main({ children }: PropsWithChildren<{}>) {
	return (
		<Box component="main" className="MainContent" sx={LocalStyles.Main}>
			{children}
		</Box>
	)
}

const LocalStyles: StyleContainer = {
	Main: {
		px: {
			xs: 2,
			md: 6,
		},
		pt: {
			xs: 'calc(12px + var(--Header-height))',
			sm: 'calc(12px + var(--Header-height))',
			md: 3,
		},
		pb: {
			xs: 2,
			sm: 2,
			md: 3,
		},
		ml: 'var(--Sidebar-width)',
		flex: 1,
		display: 'flex',
		flexDirection: 'column',
		minWidth: 0,
		height: '100dvh',
		gap: 1,
	},
}

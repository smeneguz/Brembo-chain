import { Box } from '@mui/joy'
import { Navigate, Outlet } from 'react-router-dom'
import { Main } from '../../components/main.component'
import { Sidebar } from '../../components/sidebar.component'
import { useCurrentUser } from '../../hooks/use-current-user.hook'

export function DashboardContainer() {
	const [currentUser] = useCurrentUser()

	if (!currentUser) {
		return <Navigate to="/login" />
	}

	return (
		<Box sx={{ display: 'flex', minHeight: '100dvh', width: '100%' }}>
			<Sidebar />
			<Main>
				<Outlet />
			</Main>
		</Box>
	)
}

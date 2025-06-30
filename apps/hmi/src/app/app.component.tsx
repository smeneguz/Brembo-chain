import { Box } from '@mui/joy'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Login } from './features/auth/login.component'
import { DashboardContainer } from './features/dashboard/dashboard-container.component'
import { Dashboard } from './features/dashboard/dashboard.component'
import { Stators } from './features/assembly/stators.component'
import { Rotors } from './features/assembly/rotors.component'
import { Motors } from './features/assembly/motors.component'
import { EspePage } from './features/assembly/espe.component'
import { EspeForm } from './features/assembly/espe-form.component'
import { StatorPhases } from './features/assembly/stator-phases.component'
import { RotorPhases } from './features/assembly/rotor-phases.component'
import { MotorPhases } from './features/assembly/motor-phases.component'
import { Product } from './features/product/product.component'
import { ProductList } from './features/product/productList.component'

export function App() {
	return (
		<Box sx={{ display: 'flex', minHeight: '100dvh' }}>
			<BrowserRouter>
				<Routes>
					<Route path="/login" element={<Login />} />
					<Route path="/" element={<DashboardContainer />}>
						<Route path="/" element={<Dashboard />} />
						<Route path="/stators" element={<Stators />} />
						<Route path="/rotors" element={<Rotors />} />
						<Route path="/motors" element={<Motors />} />
						<Route path="/espe" element={<EspePage />} />
						<Route path="/espe/view/:id" element={<EspeForm />} />
						<Route path="/stator/view/:id" element={<StatorPhases />} />
						<Route path="/rotor/view/:id" element={<RotorPhases />} />
						<Route path="/motor/view/:id" element={<MotorPhases />} />
						<Route path="/product" element={<Product />}/>
						<Route path="/list" element={<ProductList />}/>
					</Route>
				</Routes>
			</BrowserRouter>
		</Box>
	)
}

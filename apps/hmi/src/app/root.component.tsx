import { Toaster } from 'sonner'
import { App } from './app.component'
import { CssBaseline, CssVarsProvider, Table } from '@mui/joy'
import React from 'react'
import { SWRConfig } from 'swr'
import { fetcher } from './core/fetcher.core'
import { Provider } from 'react-redux'
import { store } from './store/store'
import { SmartTableConfigProvider } from '@polaritybit/smart-table'

export function Root() {
	return (
		<React.StrictMode>
			<CssVarsProvider>
				<CssBaseline />
				<Toaster position="top-right" />
				<Provider store={store}>
					<SmartTableConfigProvider
						config={{
							components: {
								Table: Table,
							},
						}}
					>
						<SWRConfig value={{ fetcher }}>
							<App />
						</SWRConfig>
					</SmartTableConfigProvider>
				</Provider>
			</CssVarsProvider>
		</React.StrictMode>
	)
}

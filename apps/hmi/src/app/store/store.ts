import { configureStore } from '@reduxjs/toolkit'
import { loadingStore } from './loading.store'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'

export const store = configureStore({
	reducer: {
		loaders: loadingStore.reducer,
	},
})

export type AppDispatch = typeof store.dispatch
export type AppGetState = typeof store.getState
export type AppState = ReturnType<AppGetState>

export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector
export const useAppDispatch: () => AppDispatch = useDispatch

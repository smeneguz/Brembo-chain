import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit'
import { AppDispatch, AppGetState } from './store'

export type Loader = {
	key: string
	count: number
}

export const loadingStore = createSlice({
	name: 'loading',
	initialState: [] as Loader[],
	reducers: {
		add: (state, action: PayloadAction<Loader>) => {
			state.push(action.payload)
		},
		remove: (state, action: PayloadAction<string>) => {
			return state.filter((loader) => loader.key !== action.payload)
		},
		update: (state, action: PayloadAction<Loader>) => {
			const index = state.findIndex((loader) => loader.key === action.payload.key)
			if (index !== -1) {
				state[index] = action.payload
			}
		},
	},
})

export function addLoader(key: string) {
	return function (dispatch: AppDispatch, getState: AppGetState) {
		const state = getState()
		const loader = state.loaders.find((loader) => loader.key === key)

		if (loader) {
			dispatch(loadingStore.actions.update({ ...loader, count: loader.count + 1 }))
		} else {
			dispatch(loadingStore.actions.add({ key, count: 1 }))
		}
	}
}

export function removeLoader(key: string, all: boolean = false) {
	return function (dispatch: AppDispatch, getState: AppGetState) {
		const state = getState()
		const loader = state.loaders.find((loader) => loader.key === key)

		if (loader) {
			if (loader.count === 1 || all) {
				dispatch(loadingStore.actions.remove(key))
			} else {
				dispatch(loadingStore.actions.update({ ...loader, count: loader.count - 1 }))
			}
		}
	}
}

export const isLoadingSelector = createSelector(
	[(state: ReturnType<AppGetState>) => state.loaders, (_, key: string) => key],
	(loaders, key) => !!loaders.find((loader) => loader.key === key)?.count ?? false,
)

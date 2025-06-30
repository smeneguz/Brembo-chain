import useSWR from 'swr'

export function useRotorList() {
	const { data, error, isLoading, mutate } = useSWR(`/rotor`) //to change the route name -> without all

	return { data, error, isLoading: (!data && !error) || isLoading, onRefresh: () => mutate() }
}
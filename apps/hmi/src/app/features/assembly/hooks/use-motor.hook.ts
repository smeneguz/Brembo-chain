import useSWR from 'swr'

export function useMotorList() {
	const { data, error, isLoading, mutate } = useSWR(`/assembly`) 

	return { data, error, isLoading: (!data && !error) || isLoading, onRefresh: () => mutate() }
}
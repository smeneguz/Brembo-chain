import useSWR from 'swr'

export function useEspeList() {
	const { data, error, isLoading, mutate } = useSWR(`/espe`)

	return { data, error, isLoading: (!data && !error) || isLoading, onRefresh: () => mutate() }
}

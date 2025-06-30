import useSWR from 'swr'

export function useCurrentUser() {
	const { data, mutate } = useSWR('/users/me', {
		shouldRetryOnError: false,
		onError: () => {
			if (data !== null) {
				mutate(null)
			}
		},
	})

	function handleRefresh() {
		mutate()
	}

	return [data, handleRefresh] as const
}

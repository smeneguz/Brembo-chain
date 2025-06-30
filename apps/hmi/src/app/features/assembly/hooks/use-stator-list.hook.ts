//import { Stators, StatorPhase } from 'api/src/features/prisma/client'
import useSWR from 'swr'

//type StatorWithPhase = Stators & { phases: StatorPhase[] }

export function useStatorPhasesList(id: number) {
	const { data, error, isLoading, mutate } = useSWR/*<StatorWithPhase>*/(`/stator/${id}`)

	return {
		data,
		error,
		isLoading: (!data && !error) || isLoading,
		onRefresh: () => mutate(),
	}
}
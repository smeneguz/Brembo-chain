//import { Stators, StatorPhase } from 'api/src/features/prisma/client'
import useSWR from 'swr'

//type StatorWithPhase = Stators & { phases: StatorPhase[] }

export function useRotorPhasesList(id: number) {
	const { data, error, isLoading, mutate } = useSWR/*<StatorWithPhase>*/(`/rotor/${id}`)

	return {
		data,
		error,
		isLoading: (!data && !error) || isLoading,
		onRefresh: () => mutate(),
	}
}
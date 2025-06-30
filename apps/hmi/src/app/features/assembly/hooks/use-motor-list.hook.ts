//import { Stators, StatorPhase } from 'api/src/features/prisma/client'
import useSWR from 'swr'

//type StatorWithPhase = Stators & { phases: StatorPhase[] }

export function useMotorPhasesList(id: number) {
	const { data, error, isLoading, mutate } = useSWR/*<StatorWithPhase>*/(`/assembly/${id}`)

	return {
		data,
		error,
		isLoading: (!data && !error) || isLoading,
		onRefresh: () => mutate(),
	}
}
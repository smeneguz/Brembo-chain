import useSWR from "swr";

export function useVerificationInfo(state: boolean) {
  const { data, error, isLoading, mutate } = useSWR(`/verification/${state}`); //to change the route name -> without all

  return {
    data,
    error,
    isLoading: (!data && !error) || isLoading,
    onRefresh: () => mutate(),
  };
}

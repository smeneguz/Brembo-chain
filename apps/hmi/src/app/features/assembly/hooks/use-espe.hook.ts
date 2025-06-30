import useSWR from "swr";

export function useEspe(id: number) {
  const { data, error, isLoading, mutate } = useSWR(`/espe/${id}`); //to change

  return {
    data,
    error,
    isLoading: (!data && !error) || isLoading,
    onRefresh: () => mutate(),
  };
}

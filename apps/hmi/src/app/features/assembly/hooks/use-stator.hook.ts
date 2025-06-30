import useSWR from "swr";

export function useStatorList() {
  const { data, error, isLoading, mutate } = useSWR(`/stator`); //to change the route name -> without all

  return {
    data,
    error,
    isLoading: (!data && !error) || isLoading,
    onRefresh: () => mutate(),
  };
}

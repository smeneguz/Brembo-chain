import useSWR from "swr";

export function useVerification() {
  const { data, error, isLoading, mutate } = useSWR(`/verification`); //to change the route name -> without all

  return {
    data,
    error,
    isLoading: (!data && !error) || isLoading,
    onRefresh: () => mutate(),
  };
}

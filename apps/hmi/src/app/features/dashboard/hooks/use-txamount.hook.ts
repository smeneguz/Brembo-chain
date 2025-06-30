import useSWR from "swr";

export function useTxAmount() {
  const { data, error, isLoading, mutate } = useSWR(`/txamount`);

  return {
    data,
    error,
    isLoading: (!data && !error) || isLoading,
    onRefresh: () => mutate(),
  };
}

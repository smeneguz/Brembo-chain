import useSWR from "swr";

export function useTxAmountList(date: string) {
  const { data, error, isLoading, mutate } = useSWR(`/txamount/${date}`);

  return {
    data,
    error,
    isLoading: (!data && !error) || isLoading,
    onRefresh: () => mutate(),
  };
}

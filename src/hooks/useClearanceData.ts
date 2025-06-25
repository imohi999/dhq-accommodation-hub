import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useClearanceData() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/allocations/clearance',
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate
  };
}
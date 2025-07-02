import { useEffect, useState } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then((res) => res.json());

interface SummaryData {
  total: number;
  vacant: number;
  occupied: number;
  notInUse: number;
  byCategory: {
    men: number;
    nco: number;
    officer: number;
  };
}

export const useAccommodationSummary = () => {
  const [summary, setSummary] = useState<SummaryData>({
    total: 0,
    vacant: 0,
    occupied: 0,
    notInUse: 0,
    byCategory: {
      men: 0,
      nco: 0,
      officer: 0,
    },
  });

  // Fetch summary data from a dedicated endpoint
  const { data, error, isLoading, mutate } = useSWR<SummaryData>(
    '/api/dhq-living-units/summary',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  useEffect(() => {
    if (data) {
      setSummary(data);
    }
  }, [data]);

  return {
    summary,
    loading: isLoading,
    error,
    refetch: mutate,
  };
};
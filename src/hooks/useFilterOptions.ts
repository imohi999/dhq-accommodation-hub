import useSWR from "swr";

const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch');
  }
  return res.json();
};

interface FilterOptions {
  quarterNames: string[];
  locations: string[];
  categories: string[];
  blockNames: string[];
  flatHouseRoomNames: string[];
  unitNames: string[];
  statuses: string[];
  occupancyTypes: string[];
}

export const useFilterOptions = () => {
  const { data, error, isLoading, mutate } = useSWR<FilterOptions>(
    '/api/dhq-living-units/filter-options',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      onError: (err) => {
        console.error('Error fetching filter options:', err);
      },
    }
  );

  const defaultFilterOptions: FilterOptions = {
    quarterNames: [],
    locations: [],
    categories: [],
    blockNames: [],
    flatHouseRoomNames: [],
    unitNames: [],
    statuses: ['Vacant', 'Occupied', 'Not In Use'],
    occupancyTypes: ['Single', 'Shared'],
  };

  // Ensure filterOptions is always a valid object
  const filterOptions = data && typeof data === 'object' && !Array.isArray(data) 
    ? data 
    : defaultFilterOptions;

  return {
    filterOptions,
    loading: isLoading,
    error,
    mutate,
  };
};
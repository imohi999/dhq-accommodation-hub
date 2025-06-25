import { useState, useCallback, useEffect, useRef } from "react";
interface FilterState {
  searchTerm: string;
  quarterNameFilter: string;
  locationFilter: string;
  categoryFilter: string;
  housingTypeFilter: string;
  statusFilter: string;
  occupancyFilter: string;
  blockNameFilter: string;
  flatHouseRoomFilter: string;
  unitNameFilter: string;
  page: number;
  pageSize: number;
}

export const useAccommodationFilters = () => {
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: "",
    quarterNameFilter: "all",
    locationFilter: "all",
    categoryFilter: "all",
    housingTypeFilter: "all",
    statusFilter: "all",
    occupancyFilter: "all",
    blockNameFilter: "all",
    flatHouseRoomFilter: "all",
    unitNameFilter: "all",
    page: 1,
    pageSize: 20,
  });

  // State to track the debounced search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce the search term
  useEffect(() => {
    // Clear the previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set a new timeout
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(filters.searchTerm);
    }, 1000); // 1 second delay

    // Cleanup
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [filters.searchTerm]);

  // Reset page when debounced search term changes
  const prevDebouncedSearchTermRef = useRef(debouncedSearchTerm);
  useEffect(() => {
    if (prevDebouncedSearchTermRef.current !== debouncedSearchTerm) {
      prevDebouncedSearchTermRef.current = debouncedSearchTerm;
      if (debouncedSearchTerm !== "" || filters.searchTerm === "") {
        setFilters(prev => ({ ...prev, page: 1 }));
      }
    }
  }, [debouncedSearchTerm, filters.searchTerm]);

  // Individual setters that reset page to 1 when filter changes
  const setSearchTerm = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, searchTerm: value }));
  }, []);

  const setQuarterNameFilter = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, quarterNameFilter: value, page: 1 }));
  }, []);

  const setLocationFilter = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, locationFilter: value, page: 1 }));
  }, []);

  const setCategoryFilter = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, categoryFilter: value, page: 1 }));
  }, []);

  const setHousingTypeFilter = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, housingTypeFilter: value, page: 1 }));
  }, []);

  const setStatusFilter = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, statusFilter: value, page: 1 }));
  }, []);

  const setOccupancyFilter = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, occupancyFilter: value, page: 1 }));
  }, []);

  const setBlockNameFilter = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, blockNameFilter: value, page: 1 }));
  }, []);

  const setFlatHouseRoomFilter = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, flatHouseRoomFilter: value, page: 1 }));
  }, []);

  const setUnitNameFilter = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, unitNameFilter: value, page: 1 }));
  }, []);

  // Pagination setters (don't reset page)
  const setPage = useCallback((value: number) => {
    setFilters(prev => ({ ...prev, page: value }));
  }, []);

  const setPageSize = useCallback((value: number) => {
    setFilters(prev => ({ ...prev, pageSize: value, page: 1 })); // Reset to page 1 when page size changes
  }, []);

  // Reset all filters to default values
  const resetFilters = useCallback(() => {
    setFilters({
      searchTerm: "",
      quarterNameFilter: "all",
      locationFilter: "all",
      categoryFilter: "all",
      housingTypeFilter: "all",
      statusFilter: "all",
      occupancyFilter: "all",
      blockNameFilter: "all",
      flatHouseRoomFilter: "all",
      unitNameFilter: "all",
      page: 1,
      pageSize: 20,
    });
    setDebouncedSearchTerm("");
  }, []);

  // Convert filters to API parameters
  const getApiFilters = useCallback(() => {
    const apiFilters: any = {
      page: filters.page,
      pageSize: filters.pageSize,
    };

    // Use debounced search term for API calls
    if (debouncedSearchTerm) {
      apiFilters.search = debouncedSearchTerm;
    }

    if (filters.quarterNameFilter !== "all") {
      apiFilters.quarterName = filters.quarterNameFilter;
    }

    if (filters.locationFilter !== "all") {
      apiFilters.location = filters.locationFilter;
    }

    if (filters.categoryFilter !== "all") {
      apiFilters.category = filters.categoryFilter;
    }

    if (filters.housingTypeFilter !== "all") {
      apiFilters.accommodationTypeId = filters.housingTypeFilter;
    }

    if (filters.statusFilter !== "all") {
      apiFilters.status = filters.statusFilter;
    }

    if (filters.occupancyFilter !== "all") {
      apiFilters.typeOfOccupancy = filters.occupancyFilter;
    }

    if (filters.blockNameFilter !== "all") {
      apiFilters.blockName = filters.blockNameFilter;
    }

    if (filters.flatHouseRoomFilter !== "all") {
      apiFilters.flatHouseRoomName = filters.flatHouseRoomFilter;
    }

    if (filters.unitNameFilter !== "all") {
      apiFilters.unitName = filters.unitNameFilter;
    }

    return apiFilters;
  }, [filters, debouncedSearchTerm]);

  return {
    // Filter states
    searchTerm: filters.searchTerm,
    setSearchTerm,
    quarterNameFilter: filters.quarterNameFilter,
    setQuarterNameFilter,
    locationFilter: filters.locationFilter,
    setLocationFilter,
    categoryFilter: filters.categoryFilter,
    setCategoryFilter,
    housingTypeFilter: filters.housingTypeFilter,
    setHousingTypeFilter,
    statusFilter: filters.statusFilter,
    setStatusFilter,
    occupancyFilter: filters.occupancyFilter,
    setOccupancyFilter,
    blockNameFilter: filters.blockNameFilter,
    setBlockNameFilter,
    flatHouseRoomFilter: filters.flatHouseRoomFilter,
    setFlatHouseRoomFilter,
    unitNameFilter: filters.unitNameFilter,
    setUnitNameFilter,
    
    // Pagination
    page: filters.page,
    setPage,
    pageSize: filters.pageSize,
    setPageSize,
    
    // Get API filters
    getApiFilters,
    
    // Reset filters
    resetFilters,
  };
};
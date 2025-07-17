import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { DHQLivingUnitWithHousingType, AccommodationType } from "@/types/accommodation";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface HousingTypeResponse {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

interface FilterParams {
  search?: string;
  quarterName?: string;
  location?: string;
  category?: string;
  accommodationTypeId?: string;
  status?: string;
  typeOfOccupancy?: string;
  blockName?: string;
  flatHouseRoomName?: string;
  unitName?: string;
  image?: string;
  page?: number;
  pageSize?: number;
}

interface PaginationData {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface UnitsResponse {
  data: Array<{
    id: string;
    quarterName: string;
    location: string;
    category: string;
    accommodationTypeId: string;
    noOfRooms: number;
    status: string;
    typeOfOccupancy: string;
    bq: boolean;
    noOfRoomsInBq: number;
    blockName: string;
    flatHouseRoomName: string;
    unitName: string | null;
    blockImageUrl: string | null;
    currentOccupantId: string | null;
    currentOccupantName: string | null;
    currentOccupantRank: string | null;
    currentOccupantServiceNumber: string | null;
    occupancyStartDate: string | null;
    createdAt: string;
    updatedAt: string;
    accommodationType?: {
      id: string;
      name: string;
      description: string | null;
      createdAt: string;
    };
  }>;
  pagination?: PaginationData;
}

export const useAccommodationData = (filters: FilterParams = {}) => {
  const [allUnits, setAllUnits] = useState<DHQLivingUnitWithHousingType[]>([]);

  // Fetch ALL units without pagination params
  const { data: response, error: unitsError, isLoading: unitsLoading, mutate: refetchUnits } = useSWR<UnitsResponse>(
    '/api/dhq-living-units?pageSize=10000', // Fetch all units
    fetcher
  );

  // Fetch accommodation types
  const { data: housingTypesData = [], error: housingTypesError, isLoading: housingTypesLoading } = useSWR<HousingTypeResponse[]>(
    '/api/accommodation-types',
    fetcher
  );

  useEffect(() => {
    if (unitsError) {
      console.error("Error fetching units:", unitsError);
      toast.error("Failed to fetch accommodation units");
    }
  }, [unitsError]);

  useEffect(() => {
    if (housingTypesError) {
      console.error("Error fetching accommodation types:", housingTypesError);
      toast.error("Failed to fetch accommodation types");
    }
  }, [housingTypesError]);

  useEffect(() => {
    if (response?.data) {
      // Transform API response to match expected format
      const transformedUnits: DHQLivingUnitWithHousingType[] = response.data.map((unit) => ({
        // Required camelCase properties
        id: unit.id,
        quarterName: unit.quarterName,
        location: unit.location,
        category: unit.category,
        accommodationTypeId: unit.accommodationTypeId,
        noOfRooms: unit.noOfRooms,
        status: unit.status,
        typeOfOccupancy: unit.typeOfOccupancy,
        bq: unit.bq,
        noOfRoomsInBq: unit.noOfRoomsInBq,
        blockName: unit.blockName,
        flatHouseRoomName: unit.flatHouseRoomName,
        unitName: unit.unitName,
        blockImageUrl: unit.blockImageUrl,
        currentOccupantId: unit.currentOccupantId,
        currentOccupantName: unit.currentOccupantName,
        currentOccupantRank: unit.currentOccupantRank,
        currentOccupantServiceNumber: unit.currentOccupantServiceNumber,
        occupancyStartDate: unit.occupancyStartDate,
        createdAt: unit.createdAt,
        updatedAt: unit.updatedAt,
        accommodationType: unit.accommodationType,
        // Optional snake_case properties for backward compatibility
        accommodation_type_id: unit.accommodationTypeId,
        no_of_rooms: unit.noOfRooms,
        type_of_occupancy: unit.typeOfOccupancy,
        no_of_rooms_in_bq: unit.noOfRoomsInBq,
        flat_house_room_name: unit.flatHouseRoomName,
        unit_name: unit.unitName,
        block_image_url: unit.blockImageUrl,
        current_occupant_id: unit.currentOccupantId,
        current_occupant_name: unit.currentOccupantName,
        current_occupant_rank: unit.currentOccupantRank,
        current_occupant_service_number: unit.currentOccupantServiceNumber,
        occupancy_start_date: unit.occupancyStartDate,
        created_at: unit.createdAt,
        updated_at: unit.updatedAt,
        housing_type: unit.accommodationType ? {
          id: unit.accommodationType.id,
          name: unit.accommodationType.name,
          description: unit.accommodationType.description,
          createdAt: unit.accommodationType.createdAt,
        } : undefined,
      }));

      setAllUnits(transformedUnits || []);
    }
  }, [response]);

  // Apply client-side filtering
  const filteredUnits = useMemo(() => {
    let filtered = [...allUnits];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(unit =>
        unit.quarterName?.toLowerCase().includes(searchLower) ||
        unit.location?.toLowerCase().includes(searchLower) ||
        unit.unitName?.toLowerCase().includes(searchLower) ||
        unit.blockName?.toLowerCase().includes(searchLower) ||
        unit.flatHouseRoomName?.toLowerCase().includes(searchLower) ||
        unit.currentOccupantName?.toLowerCase().includes(searchLower) ||
        unit.currentOccupantServiceNumber?.toLowerCase().includes(searchLower) ||
        unit.currentOccupantRank?.toLowerCase().includes(searchLower)
      );
    }

    // Quarter name filter
    if (filters.quarterName && filters.quarterName !== 'all') {
      filtered = filtered.filter(unit => unit.quarterName === filters.quarterName);
    }

    // Location filter
    if (filters.location && filters.location !== 'all') {
      filtered = filtered.filter(unit => unit.location === filters.location);
    }

    // Category filter
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(unit => unit.category === filters.category);
    }

    // Accommodation type filter
    if (filters.accommodationTypeId && filters.accommodationTypeId !== 'all') {
      filtered = filtered.filter(unit => unit.accommodationTypeId === filters.accommodationTypeId);
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(unit => unit.status === filters.status);
    }

    // Type of occupancy filter
    if (filters.typeOfOccupancy && filters.typeOfOccupancy !== 'all') {
      filtered = filtered.filter(unit => unit.typeOfOccupancy === filters.typeOfOccupancy);
    }

    // Block name filter
    if (filters.blockName && filters.blockName !== 'all') {
      filtered = filtered.filter(unit => unit.blockName === filters.blockName);
    }

    // Flat/House/Room name filter
    if (filters.flatHouseRoomName && filters.flatHouseRoomName !== 'all') {
      filtered = filtered.filter(unit => unit.flatHouseRoomName === filters.flatHouseRoomName);
    }

    // Unit name filter
    if (filters.unitName && filters.unitName !== 'all') {
      filtered = filtered.filter(unit => unit.unitName === filters.unitName);
    }

    // Image filter
    if (filters.image && filters.image !== 'all') {
      if (filters.image === 'with') {
        filtered = filtered.filter(unit => unit.blockImageUrl !== null && unit.blockImageUrl !== undefined && unit.blockImageUrl !== '');
      } else if (filters.image === 'without') {
        filtered = filtered.filter(unit => unit.blockImageUrl === null || unit.blockImageUrl === undefined || unit.blockImageUrl === '');
      }
    }

    return filtered;
  }, [allUnits, filters]);

  // Apply client-side pagination
  const paginatedData = useMemo(() => {
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 20;
    const totalCount = filteredUnits.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    const paginatedUnits = filteredUnits.slice(startIndex, endIndex);

    const pagination: PaginationData = {
      page,
      pageSize,
      totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };

    return {
      units: paginatedUnits,
      pagination
    };
  }, [filteredUnits, filters.page, filters.pageSize]);

  // Transform accommodation types
  const housingTypes: AccommodationType[] = housingTypesData?.map((ht) => ({
    id: ht.id,
    name: ht.name,
    description: ht.description,
    createdAt: ht.createdAt,
  })) || [];

  const loading = unitsLoading || housingTypesLoading;

  const refetch = async () => {
    await refetchUnits();
  };

  return {
    units: paginatedData.units,
    housingTypes,
    loading,
    refetch,
    pagination: paginatedData.pagination
  };
};
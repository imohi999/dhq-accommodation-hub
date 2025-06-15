
import { DHQLivingUnitWithHousingType } from "@/types/accommodation";
import useSWR from "swr";

// API response type
interface ApiUnit {
  id: string;
  quarterName: string;
  location: string;
  category: string;
  housingTypeId: string;
  noOfRooms: number;
  status: string;
  typeOfOccupancy: string;
  bq: boolean;
  noOfRoomsInBq: number;
  blockName: string;
  flatHouseRoomName: string;
  unitName: string;
  blockImageUrl: string | null;
  currentOccupantName: string | null;
  currentOccupantRank: string | null;
  currentOccupantServiceNumber: string | null;
  currentOccupantId: string | null;
  occupancyStartDate: string | null;
  createdAt: string;
  updatedAt: string;
  housingType?: {
    id: string;
    name: string;
    description?: string | null;
    createdAt: string;
  };
}

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch occupied units");
  }
  const result = await response.json();
  // dhq-living-units API returns array directly
  return Array.isArray(result) ? result : [];
};

// Transform API response to match our expected format
const transformUnit = (unit: ApiUnit): DHQLivingUnitWithHousingType => ({
  id: unit.id,
  quarterName: unit.quarterName,
  location: unit.location,
  category: unit.category,
  housing_type_id: unit.housingTypeId,
  no_of_rooms: unit.noOfRooms,
  status: unit.status,
  type_of_occupancy: unit.typeOfOccupancy,
  bq: unit.bq,
  no_of_rooms_in_bq: unit.noOfRoomsInBq,
  blockName: unit.blockName,
  flat_house_room_name: unit.flatHouseRoomName,
  unit_name: unit.unitName,
  block_image_url: unit.blockImageUrl,
  current_occupant_name: unit.currentOccupantName,
  current_occupant_rank: unit.currentOccupantRank,
  current_occupant_service_number: unit.currentOccupantServiceNumber,
  current_occupant_id: unit.currentOccupantId,
  occupancy_start_date: unit.occupancyStartDate,
  created_at: unit.createdAt,
  updated_at: unit.updatedAt,
  housing_type: unit.housingType ? {
    id: unit.housingType.id,
    name: unit.housingType.name,
    description: unit.housingType.description,
    createdAt: unit.housingType.createdAt
  } : undefined
});

// Hook to fetch occupied units using SWR
export const useOccupiedUnits = () => {
  const { data, error, mutate } = useSWR(
    '/api/dhq-living-units?status=Occupied',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const transformedData = data?.map(transformUnit) || [];

  return {
    data: transformedData,
    error,
    isLoading: !error && !data,
    mutate,
  };
};

// Legacy function for backward compatibility
export const fetchOccupiedUnitsFromDb = async (): Promise<DHQLivingUnitWithHousingType[] | null> => {
  console.log("Fetching occupied units from API...");
  try {
    const response = await fetch('/api/dhq-living-units?status=Occupied');

    if (!response.ok) {
      console.error("Error fetching occupied units:", response.statusText);
      return null;
    }

    const result = await response.json();
    const data = Array.isArray(result) ? result : [];

    const transformedData = data.map(transformUnit);

    console.log("Fetched occupied units:", transformedData);
    return transformedData;
  } catch (error) {
    console.error("Unexpected error fetching occupied units:", error);
    return null;
  }
};

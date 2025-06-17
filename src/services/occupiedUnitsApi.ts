
import { DHQLivingUnitWithHousingType } from "@/types/accommodation";
import useSWR from "swr";

// API response type
interface ApiUnit {
  id: string;
  quarterName: string;
  location: string;
  category: string;
  accomodationTypeId: string;
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
  accommodationType?: {
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
  // Required camelCase properties
  id: unit.id,
  quarterName: unit.quarterName,
  location: unit.location,
  category: unit.category,
  accomodationTypeId: unit.accomodationTypeId,
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
  accomodation_type_id: unit.accomodationTypeId,
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
    createdAt: unit.accommodationType.createdAt
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

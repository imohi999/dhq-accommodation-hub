
import { DHQLivingUnitWithHousingType } from "@/types/accommodation";

// Extended type to include occupants
export interface DHQLivingUnitWithOccupants extends DHQLivingUnitWithHousingType {
  occupants?: Array<{
    id: string;
    unitId: string;
    queueId: string;
    fullName: string;
    rank: string;
    serviceNumber: string;
    phone: string | null;
    email: string | null;
    emergencyContact: string | null;
    occupancyStartDate: string;
    isCurrent: boolean;
    createdAt: string;
    updatedAt: string;
    queue?: {
      id: string;
      armOfService: string;
      [key: string]: any;
    };
  }>;
}
import useSWR from "swr";

// API response type
interface ApiUnit {
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
  occupants?: Array<{
    id: string;
    unitId: string;
    queueId: string;
    fullName: string;
    rank: string;
    serviceNumber: string;
    phone: string | null;
    email: string | null;
    emergencyContact: string | null;
    occupancyStartDate: string;
    isCurrent: boolean;
    createdAt: string;
    updatedAt: string;
    queue?: {
      id: string;
      armOfService: string;
      [key: string]: any;
    };
  }>;
}

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch occupied units");
  }
  const result = await response.json();
  // API returns paginated data with 'data' property
  return result.data || [];
};

// Transform API response to match our expected format
const transformUnit = (unit: ApiUnit): DHQLivingUnitWithOccupants => ({
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
    createdAt: unit.accommodationType.createdAt
  } : undefined,
  // Include occupants data
  occupants: unit.occupants
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

  // Ensure data is always an array before mapping
  const safeData = Array.isArray(data) ? data : [];
  const transformedData = safeData.map(transformUnit);

  return {
    data: transformedData,
    error,
    isLoading: !error && !data,
    mutate,
  };
};

// Legacy function for backward compatibility
export const fetchOccupiedUnitsFromDb = async (): Promise<DHQLivingUnitWithOccupants[] | null> => {
  console.log("Fetching occupied units from API...");
  try {
    const response = await fetch('/api/dhq-living-units?status=Occupied');

    if (!response.ok) {
      console.error("Error fetching occupied units:", response.statusText);
      return null;
    }

    const result = await response.json();
    const data = result.data || [];

    const transformedData = data.map(transformUnit);

    console.log("Fetched occupied units:", transformedData);
    return transformedData;
  } catch (error) {
    console.error("Unexpected error fetching occupied units:", error);
    return null;
  }
};

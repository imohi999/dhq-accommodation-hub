
import { DHQLivingUnitWithHousingType } from "@/types/accommodation";
import useSWR, { mutate } from "swr";

// API response type for accommodation units
interface ApiAccommodationUnit {
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
    throw new Error("Failed to fetch unit data");
  }
  return response.json();
};

// Transform API response to match our expected format
const transformUnit = (unit: ApiAccommodationUnit): DHQLivingUnitWithHousingType => ({
  // Required camelCase properties
  id: unit.id,
  quarterName: unit.quarterName,
  location: unit.location,
  category: unit.category,
  housingTypeId: unit.housingTypeId,
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
  housingType: unit.housingType,
  // Optional snake_case properties for backward compatibility
  housing_type_id: unit.housingTypeId,
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
  housing_type: unit.housingType ? {
    id: unit.housingType.id,
    name: unit.housingType.name,
    description: unit.housingType.description,
    createdAt: unit.housingType.createdAt
  } : undefined
});

// Hook to fetch a single unit using SWR
export const useUnit = (unitId: string) => {
  const { data, error, mutate: swrMutate } = useSWR<ApiAccommodationUnit>(
    unitId ? `/api/accommodations/${unitId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const transformedData = data ? transformUnit(data) : null;

  return {
    data: transformedData,
    error,
    isLoading: !error && !data,
    mutate: swrMutate,
  };
};

// Update unit occupancy
export const updateUnitOccupancy = async (
  unitId: string,
  occupantName: string,
  occupantRank: string,
  serviceNumber: string,
  occupantId?: string
): Promise<boolean> => {
  console.log(`Updating unit occupancy for unit ${unitId}`);
  try {
    const requestData = {
      status: 'Occupied',
      currentOccupantName: occupantName,
      currentOccupantRank: occupantRank,
      currentOccupantServiceNumber: serviceNumber,
      currentOccupantId: occupantId || null,
      occupancyStartDate: new Date().toISOString().split('T')[0], // Today's date
    };

    const response = await fetch(`/api/accommodations/${unitId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      console.error("Error updating unit occupancy:", response.statusText);
      return false;
    }

    // Invalidate the cache for this unit and all accommodations
    await mutate(`/api/accommodations/${unitId}`);
    await mutate(key => typeof key === 'string' && key.startsWith('/api/accommodations'));

    console.log("Successfully updated unit occupancy");
    return true;
  } catch (error) {
    console.error("Unexpected error updating unit occupancy:", error);
    return false;
  }
};

// Clear unit occupancy (make vacant)
export const clearUnitOccupancy = async (unitId: string): Promise<boolean> => {
  console.log(`Clearing unit occupancy for unit ${unitId}`);
  try {
    const requestData = {
      status: 'Vacant',
      currentOccupantName: null,
      currentOccupantRank: null,
      currentOccupantServiceNumber: null,
      currentOccupantId: null,
      occupancyStartDate: null,
    };

    const response = await fetch(`/api/accommodations/${unitId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      console.error("Error clearing unit occupancy:", response.statusText);
      return false;
    }

    // Invalidate the cache
    await mutate(`/api/accommodations/${unitId}`);
    await mutate(key => typeof key === 'string' && key.startsWith('/api/accommodations'));

    console.log("Successfully cleared unit occupancy");
    return true;
  } catch (error) {
    console.error("Unexpected error clearing unit occupancy:", error);
    return false;
  }
};

// Update unit status only
export const updateUnitStatus = async (
  unitId: string,
  status: 'Vacant' | 'Occupied' | 'Not In Use'
): Promise<boolean> => {
  console.log(`Updating unit status for unit ${unitId} to ${status}`);
  try {
    const response = await fetch(`/api/accommodations/${unitId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      console.error("Error updating unit status:", response.statusText);
      return false;
    }

    // Invalidate the cache
    await mutate(`/api/accommodations/${unitId}`);
    await mutate(key => typeof key === 'string' && key.startsWith('/api/accommodations'));

    console.log("Successfully updated unit status");
    return true;
  } catch (error) {
    console.error("Unexpected error updating unit status:", error);
    return false;
  }
};

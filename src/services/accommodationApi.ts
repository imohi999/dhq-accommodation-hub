import { DHQLivingUnitWithHousingType } from "@/types/accommodation";

// Fetch a single accommodation unit by ID
export const fetchAccommodationById = async (id: string): Promise<DHQLivingUnitWithHousingType | null> => {
  try {
    const response = await fetch(`/api/dhq-living-units/${id}`);

    if (!response.ok) {
      console.error("Error fetching accommodation:", response.statusText);
      return null;
    }

    const data = await response.json();

    // Transform API response to match our type (include both camelCase and snake_case)
    return {
      // Required camelCase properties
      id: data.id,
      quarterName: data.quarterName,
      location: data.location,
      category: data.category,
      accomodationTypeId: data.accomodationTypeId,
      noOfRooms: data.noOfRooms,
      status: data.status,
      typeOfOccupancy: data.typeOfOccupancy,
      bq: data.bq,
      noOfRoomsInBq: data.noOfRoomsInBq,
      blockName: data.blockName,
      flatHouseRoomName: data.flatHouseRoomName,
      unitName: data.unitName,
      blockImageUrl: data.blockImageUrl,
      currentOccupantId: data.currentOccupantId,
      currentOccupantName: data.currentOccupantName,
      currentOccupantRank: data.currentOccupantRank,
      currentOccupantServiceNumber: data.currentOccupantServiceNumber,
      occupancyStartDate: data.occupancyStartDate,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      accommodationType: data.accommodationType,
      // Optional snake_case properties for backward compatibility
      accomodation_type_id: data.accomodationTypeId,
      no_of_rooms: data.noOfRooms,
      type_of_occupancy: data.typeOfOccupancy,
      no_of_rooms_in_bq: data.noOfRoomsInBq,
      flat_house_room_name: data.flatHouseRoomName,
      unit_name: data.unitName,
      block_image_url: data.blockImageUrl,
      current_occupant_id: data.currentOccupantId,
      current_occupant_name: data.currentOccupantName,
      current_occupant_rank: data.currentOccupantRank,
      current_occupant_service_number: data.currentOccupantServiceNumber,
      occupancy_start_date: data.occupancyStartDate,
      created_at: data.createdAt,
      updated_at: data.updatedAt,
      housing_type: data.accommodationType ? {
        id: data.accommodationType.id,
        name: data.accommodationType.name,
        description: data.accommodationType.description,
        createdAt: data.accommodationType.createdAt,
      } : undefined
    };
  } catch (error) {
    console.error("Unexpected error fetching accommodation:", error);
    return null;
  }
};

// Update accommodation unit status
export const updateAccommodationStatus = async (
  id: string,
  updates: {
    status?: 'Vacant' | 'Occupied' | 'Not In Use';
    currentOccupantName?: string | null;
    currentOccupantRank?: string | null;
    currentOccupantServiceNumber?: string | null;
    currentOccupantId?: string | null;
    occupancyStartDate?: string | null;
  }
): Promise<boolean> => {
  try {
    const response = await fetch(`/api/dhq-living-units/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      console.error("Error updating accommodation:", response.statusText);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Unexpected error updating accommodation:", error);
    return false;
  }
};
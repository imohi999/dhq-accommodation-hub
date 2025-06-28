import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { DHQLivingUnitWithHousingType } from "@/types/accommodation";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

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
}

export const useAllUnits = () => {
  const [units, setUnits] = useState<DHQLivingUnitWithHousingType[]>([]);

  // Fetch ALL units without pagination
  const { data: response, error, isLoading, mutate: refetch } = useSWR<UnitsResponse>(
    '/api/dhq-living-units?pageSize=10000', // Fetch all units
    fetcher
  );

  useEffect(() => {
    if (error) {
      console.error("Error fetching all units:", error);
      toast.error("Failed to fetch accommodation units");
    }
  }, [error]);

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

      setUnits(transformedUnits || []);
    }
  }, [response]);

  return {
    units,
    loading: isLoading,
    refetch
  };
};
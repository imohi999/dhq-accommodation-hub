import { useState, useEffect } from "react";
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

export const useAccommodationData = () => {
  const [units, setUnits] = useState<DHQLivingUnitWithHousingType[]>([]);

  // Fetch units from new dhq-living-units endpoint
  const { data: unitsData, error: unitsError, isLoading: unitsLoading, mutate: refetchUnits } = useSWR<Array<{
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
  }>>(
    '/api/dhq-living-units',
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
  }, [unitsError, toast]);

  useEffect(() => {
    if (housingTypesError) {
      console.error("Error fetching accommodation types:", housingTypesError);
      toast.error("Failed to fetch accommodation types");
    }
  }, [housingTypesError, toast]);

  useEffect(() => {
    if (unitsData) {
      // Transform API response to match expected format (camelCase to snake_case)
      const transformedUnits: DHQLivingUnitWithHousingType[] = unitsData.map((unit) => ({
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
  }, [unitsData]);

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
    units,
    housingTypes,
    loading,
    refetch
  };
};
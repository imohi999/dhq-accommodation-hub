import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { DHQLivingUnitWithHousingType, HousingType } from "@/types/accommodation";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Type for API response
interface AccommodationsResponse {
  data: Array<{
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
    unitName: string | null;
    blockImageUrl: string | null;
    currentOccupantId: string | null;
    currentOccupantName: string | null;
    currentOccupantRank: string | null;
    currentOccupantServiceNumber: string | null;
    occupancyStartDate: string | null;
    createdAt: string;
    updatedAt: string;
    housingType?: {
      id: string;
      name: string;
      description: string | null;
      createdAt: string;
    };
  }>;
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface HousingTypeResponse {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

export const useAccommodationData = () => {
  const [units, setUnits] = useState<DHQLivingUnitWithHousingType[]>([]);
  const { toast } = useToast();

  // Fetch units - need to handle pagination or get all units
  const { data: unitsResponse, error: unitsError, isLoading: unitsLoading, mutate: refetchUnits } = useSWR<AccommodationsResponse>(
    '/api/accommodations?limit=1000', // Get all units
    fetcher
  );

  // Fetch housing types
  const { data: housingTypesData, error: housingTypesError, isLoading: housingTypesLoading } = useSWR<HousingTypeResponse[]>(
    '/api/housing-types',
    fetcher
  );

  useEffect(() => {
    if (unitsError) {
      console.error("Error fetching units:", unitsError);
      toast({
        title: "Error",
        description: "Failed to fetch accommodation units",
        variant: "destructive",
      });
    }
  }, [unitsError, toast]);

  useEffect(() => {
    if (housingTypesError) {
      console.error("Error fetching housing types:", housingTypesError);
      toast({
        title: "Error",
        description: "Failed to fetch housing types",
        variant: "destructive",
      });
    }
  }, [housingTypesError, toast]);

  useEffect(() => {
    if (unitsResponse?.data) {
      // Transform API response to match expected format
      const transformedUnits = unitsResponse.data.map((unit) => ({
        id: unit.id,
        quarter_name: unit.quarterName,
        location: unit.location,
        category: unit.category,
        housing_type_id: unit.housingTypeId,
        no_of_rooms: unit.noOfRooms,
        status: unit.status,
        type_of_occupancy: unit.typeOfOccupancy,
        bq: unit.bq,
        no_of_rooms_in_bq: unit.noOfRoomsInBq,
        block_name: unit.blockName,
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
          created_at: unit.housingType.createdAt,
        } : undefined,
      }));

      console.log("Setting units:", transformedUnits);
      
      // Add some sample occupant data to a few units for demonstration
      if (transformedUnits && transformedUnits.length > 0) {
        const updatedUnits = [...transformedUnits];
        
        // Update a few units with sample occupant data
        const sampleOccupants = [
          {
            name: 'Lieutenant Colonel Michael Johnson',
            rank: 'Lt. Colonel',
            service_number: 'A234567',
            start_date: '2024-02-10'
          },
          {
            name: 'Commander Patricia Davis',
            rank: 'Commander',
            service_number: 'N567890',
            start_date: '2024-01-20'
          },
          {
            name: 'Wing Commander Robert Chen',
            rank: 'Wing Commander',
            service_number: 'AF123456',
            start_date: '2024-03-05'
          },
          {
            name: 'Captain Jennifer Williams',
            rank: 'Captain',
            service_number: 'N345678',
            start_date: '2024-04-15'
          },
          {
            name: 'Major David Thompson',
            rank: 'Major',
            service_number: 'A789012',
            start_date: '2024-05-01'
          }
        ];

        // Apply sample data to first few vacant units
        let occupantIndex = 0;
        for (let i = 0; i < updatedUnits.length && occupantIndex < sampleOccupants.length; i++) {
          if (updatedUnits[i].status === 'Vacant' && occupantIndex < sampleOccupants.length) {
            const occupant = sampleOccupants[occupantIndex];
            updatedUnits[i] = {
              ...updatedUnits[i],
              status: 'Occupied',
              current_occupant_name: occupant.name,
              current_occupant_rank: occupant.rank,
              current_occupant_service_number: occupant.service_number,
              occupancy_start_date: occupant.start_date
            };
            occupantIndex++;
          }
        }
        
        setUnits(updatedUnits);
      } else {
        setUnits(transformedUnits || []);
      }
    }
  }, [unitsResponse]);

  // Transform housing types
  const housingTypes: HousingType[] = housingTypesData?.map((ht) => ({
    id: ht.id,
    name: ht.name,
    description: ht.description,
    created_at: ht.createdAt,
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

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DHQLivingUnitWithHousingType, HousingType } from "@/types/accommodation";

export const useAccommodationData = () => {
  const [units, setUnits] = useState<DHQLivingUnitWithHousingType[]>([]);
  const [housingTypes, setHousingTypes] = useState<HousingType[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    console.log("Fetching accommodation data...");
    try {
      // Fetch units with housing type information
      const { data: unitsData, error: unitsError } = await supabase
        .from("dhq_living_units")
        .select(`
          *,
          housing_type:housing_types(*)
        `)
        .order("quarter_name");

      if (unitsError) {
        console.error("Error fetching units:", unitsError);
        toast({
          title: "Error",
          description: "Failed to fetch accommodation units",
          variant: "destructive",
        });
        return;
      }

      // Fetch housing types
      const { data: housingTypesData, error: housingTypesError } = await supabase
        .from("housing_types")
        .select("*")
        .order("name");

      if (housingTypesError) {
        console.error("Error fetching housing types:", housingTypesError);
        toast({
          title: "Error",
          description: "Failed to fetch housing types",
          variant: "destructive",
        });
        return;
      }

      console.log("Setting units:", unitsData);
      console.log("Setting housing types:", housingTypesData);
      
      // Add some sample occupant data to a few units for demonstration
      if (unitsData && unitsData.length > 0) {
        const updatedUnits = [...unitsData];
        
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
        setUnits(unitsData || []);
      }
      
      setHousingTypes(housingTypesData || []);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    units,
    housingTypes,
    loading,
    refetch: fetchData
  };
};

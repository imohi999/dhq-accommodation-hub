
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
      
      setUnits(unitsData || []);
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

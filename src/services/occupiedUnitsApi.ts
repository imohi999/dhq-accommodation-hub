
import { supabase } from "@/integrations/supabase/client";
import { DHQLivingUnitWithHousingType } from "@/types/accommodation";

export const fetchOccupiedUnitsFromDb = async (): Promise<DHQLivingUnitWithHousingType[] | null> => {
  console.log("Fetching occupied units from dhq_living_units...");
  try {
    const { data, error } = await supabase
      .from("dhq_living_units")
      .select(`
        *,
        housing_type:housing_types(*)
      `)
      .eq("status", "Occupied")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching occupied units:", error);
      return null;
    }

    console.log("Fetched occupied units:", data);
    return data || [];
  } catch (error) {
    console.error("Unexpected error fetching occupied units:", error);
    return null;
  }
};

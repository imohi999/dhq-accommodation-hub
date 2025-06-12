
import { supabase } from "@/integrations/supabase/client";

export const updateUnitOccupancy = async (
  unitId: string,
  occupantName: string,
  occupantRank: string,
  serviceNumber: string
): Promise<boolean> => {
  console.log(`Updating unit occupancy for unit ${unitId}`);
  try {
    const { error } = await supabase
      .from("dhq_living_units")
      .update({
        status: 'Occupied',
        current_occupant_name: occupantName,
        current_occupant_rank: occupantRank,
        current_occupant_service_number: serviceNumber,
        occupancy_start_date: new Date().toISOString().split('T')[0], // Today's date
      })
      .eq("id", unitId);

    if (error) {
      console.error("Error updating unit occupancy:", error);
      return false;
    }

    console.log("Successfully updated unit occupancy");
    return true;
  } catch (error) {
    console.error("Unexpected error updating unit occupancy:", error);
    return false;
  }
};

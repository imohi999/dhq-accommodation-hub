
import { supabase } from "@/integrations/supabase/client";
import { DHQLivingUnitWithHousingType } from "@/types/accommodation";

export const transferPersonnelToNewUnit = async (
  currentUnitId: string,
  newUnitId: string,
  personnelName: string,
  personnelRank: string,
  serviceNumber: string
): Promise<boolean> => {
  console.log(`Transferring personnel from unit ${currentUnitId} to unit ${newUnitId}`);
  
  try {
    // Start a transaction by updating both units
    const { error: oldUnitError } = await supabase
      .from("dhq_living_units")
      .update({
        status: 'Vacant',
        current_occupant_name: null,
        current_occupant_rank: null,
        current_occupant_service_number: null,
        current_occupant_id: null,
        occupancy_start_date: null,
      })
      .eq("id", currentUnitId);

    if (oldUnitError) {
      console.error("Error updating old unit:", oldUnitError);
      return false;
    }

    const { error: newUnitError } = await supabase
      .from("dhq_living_units")
      .update({
        status: 'Occupied',
        current_occupant_name: personnelName,
        current_occupant_rank: personnelRank,
        current_occupant_service_number: serviceNumber,
        occupancy_start_date: new Date().toISOString().split('T')[0],
      })
      .eq("id", newUnitId);

    if (newUnitError) {
      console.error("Error updating new unit:", newUnitError);
      // Rollback the old unit change
      await supabase
        .from("dhq_living_units")
        .update({
          status: 'Occupied',
          current_occupant_name: personnelName,
          current_occupant_rank: personnelRank,
          current_occupant_service_number: serviceNumber,
        })
        .eq("id", currentUnitId);
      return false;
    }

    console.log("Successfully transferred personnel to new unit");
    return true;
  } catch (error) {
    console.error("Unexpected error during transfer:", error);
    return false;
  }
};

export const deallocatePersonnelFromUnit = async (
  unitId: string,
  personnelData: {
    name: string;
    rank: string;
    serviceNumber: string;
  },
  unitData: DHQLivingUnitWithHousingType,
  reason?: string
): Promise<boolean> => {
  console.log(`Deallocating personnel from unit ${unitId}`);
  
  try {
    // Add to past allocations
    const { error: pastAllocationError } = await supabase
      .from("past_allocations")
      .insert({
        personnel_id: unitId, // Using unit ID as we don't have personnel ID
        unit_id: unitId,
        personnel_data: {
          full_name: personnelData.name,
          rank: personnelData.rank,
          svc_no: personnelData.serviceNumber,
        },
        unit_data: unitData,
        allocation_start_date: unitData.occupancy_start_date || new Date().toISOString().split('T')[0],
        allocation_end_date: new Date().toISOString().split('T')[0],
        deallocation_date: new Date().toISOString(),
        reason_for_leaving: reason || 'Manual deallocation',
        letter_id: `DEALLOC-${Date.now()}`,
      });

    if (pastAllocationError) {
      console.error("Error adding to past allocations:", pastAllocationError);
      return false;
    }

    // Clear unit occupancy
    const { error: unitError } = await supabase
      .from("dhq_living_units")
      .update({
        status: 'Vacant',
        current_occupant_name: null,
        current_occupant_rank: null,
        current_occupant_service_number: null,
        current_occupant_id: null,
        occupancy_start_date: null,
      })
      .eq("id", unitId);

    if (unitError) {
      console.error("Error clearing unit occupancy:", unitError);
      return false;
    }

    console.log("Successfully deallocated personnel from unit");
    return true;
  } catch (error) {
    console.error("Unexpected error during deallocation:", error);
    return false;
  }
};

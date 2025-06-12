
import { supabase } from "@/integrations/supabase/client";
import { DHQLivingUnitWithHousingType } from "@/types/accommodation";
import { generateLetterId } from "./letterIdApi";

export const createTransferAllocationRequest = async (
  currentUnitId: string,
  newUnitId: string,
  personnelName: string,
  personnelRank: string,
  serviceNumber: string
): Promise<boolean> => {
  console.log(`Creating transfer allocation request from unit ${currentUnitId} to unit ${newUnitId}`);
  
  try {
    // Get current unit details
    const { data: currentUnit, error: currentUnitError } = await supabase
      .from("dhq_living_units")
      .select(`
        *,
        housing_type:housing_types(*)
      `)
      .eq("id", currentUnitId)
      .single();

    if (currentUnitError || !currentUnit) {
      console.error("Error fetching current unit:", currentUnitError);
      return false;
    }

    // Get new unit details
    const { data: newUnit, error: newUnitError } = await supabase
      .from("dhq_living_units")
      .select(`
        *,
        housing_type:housing_types(*)
      `)
      .eq("id", newUnitId)
      .single();

    if (newUnitError || !newUnit) {
      console.error("Error fetching new unit:", newUnitError);
      return false;
    }

    // Generate letter ID
    const letterId = await generateLetterId();
    if (!letterId) {
      console.error("Failed to generate letter ID");
      return false;
    }

    // Create personnel data object
    const personnelData = {
      id: crypto.randomUUID(),
      sequence: 1,
      full_name: personnelName,
      svc_no: serviceNumber,
      gender: 'Male', // Default - would need to be captured properly
      arm_of_service: 'Navy', // Default - would need to be captured properly
      category: currentUnit.category,
      rank: personnelRank,
      marital_status: 'Single', // Default - would need to be captured properly
      no_of_adult_dependents: 0,
      no_of_child_dependents: 0,
      current_unit: 'Naval Academy', // Default - would need to be captured properly
      appointment: 'Academy Instructor', // Default - would need to be captured properly
      date_tos: null,
      date_sos: null,
      phone: null,
      entry_date_time: new Date().toISOString(),
    };

    // Create allocation request for transfer
    const { error: allocationError } = await supabase
      .from("allocation_requests")
      .insert({
        personnel_id: personnelData.id,
        unit_id: newUnitId,
        letter_id: letterId,
        personnel_data: personnelData,
        unit_data: JSON.parse(JSON.stringify(newUnit)),
        status: 'pending',
        allocation_date: new Date().toISOString()
      });

    if (allocationError) {
      console.error("Error creating transfer allocation request:", allocationError);
      return false;
    }

    console.log("Successfully created transfer allocation request");
    return true;
  } catch (error) {
    console.error("Unexpected error during transfer request creation:", error);
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
    // Convert the unit data to proper JSON format for database storage
    const unitDataJson = JSON.parse(JSON.stringify(unitData));
    
    // Generate a personnel ID since we don't have one from the occupied unit
    const personnelId = crypto.randomUUID();
    
    // Add to past allocations
    const { error: pastAllocationError } = await supabase
      .from("past_allocations")
      .insert({
        personnel_id: personnelId,
        unit_id: unitId,
        personnel_data: {
          full_name: personnelData.name,
          rank: personnelData.rank,
          svc_no: personnelData.serviceNumber,
        },
        unit_data: unitDataJson,
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

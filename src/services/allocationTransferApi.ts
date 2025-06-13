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

    // Generate proper letter ID using the database function
    const letterId = await generateLetterId();
    if (!letterId) {
      console.error("Failed to generate letter ID for transfer request");
      return false;
    }

    console.log("Generated letter ID for transfer:", letterId);

    // Generate proper UUID for personnel_id
    const personnelId = crypto.randomUUID();

    // Create comprehensive personnel data object for transfer
    const personnelData = {
      id: personnelId,
      sequence: 1,
      full_name: personnelName,
      svc_no: serviceNumber,
      gender: 'Male',
      arm_of_service: 'Navy',
      category: currentUnit.category,
      rank: personnelRank,
      marital_status: 'Married',
      no_of_adult_dependents: 1,
      no_of_child_dependents: 1,
      current_unit: 'DHQ Garrison',
      appointment: 'Staff Officer',
      phone: '+234-801-000-0000',
      entry_date_time: new Date().toISOString(),
    };

    // Create simplified unit data
    const simplifiedUnitData = {
      id: newUnit.id,
      quarter_name: newUnit.quarter_name,
      location: newUnit.location,
      block_name: newUnit.block_name,
      flat_house_room_name: newUnit.flat_house_room_name,
      category: newUnit.category,
      no_of_rooms: newUnit.no_of_rooms,
      status: newUnit.status,
      housing_type: newUnit.housing_type ? {
        id: newUnit.housing_type.id,
        name: newUnit.housing_type.name,
        description: newUnit.housing_type.description
      } : null
    };

    console.log("About to insert allocation request with data:", {
      personnel_id: personnelId,
      unit_id: newUnitId,
      letter_id: letterId,
      status: 'pending'
    });

    // Create allocation request for transfer with proper data structure
    const { data: insertedData, error: allocationError } = await supabase
      .from("allocation_requests")
      .insert({
        personnel_id: personnelId,
        unit_id: newUnitId,
        letter_id: letterId,
        personnel_data: personnelData,
        unit_data: simplifiedUnitData,
        status: 'pending',
        allocation_date: new Date().toISOString()
      })
      .select()
      .single();

    if (allocationError) {
      console.error("Error creating transfer allocation request:", allocationError);
      console.error("Error details:", {
        message: allocationError.message,
        code: allocationError.code,
        hint: allocationError.hint,
        details: allocationError.details
      });
      return false;
    }

    console.log("Successfully created transfer allocation request:", insertedData);
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
    // Simplify unit data for database storage
    const simplifiedUnitData = {
      id: unitData.id,
      quarter_name: unitData.quarter_name,
      location: unitData.location,
      block_name: unitData.block_name,
      flat_house_room_name: unitData.flat_house_room_name,
      category: unitData.category,
      no_of_rooms: unitData.no_of_rooms,
      status: unitData.status,
      housing_type: unitData.housing_type ? {
        id: unitData.housing_type.id,
        name: unitData.housing_type.name,
        description: unitData.housing_type.description
      } : null
    };
    
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
        unit_data: simplifiedUnitData,
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

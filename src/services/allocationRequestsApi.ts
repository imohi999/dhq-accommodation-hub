
import { supabase } from "@/integrations/supabase/client";
import { QueueItem } from "@/types/queue";
import { DHQLivingUnitWithHousingType } from "@/types/accommodation";
import { AllocationRequest } from "@/types/allocation";

export const fetchAllocationRequestsFromDb = async (): Promise<AllocationRequest[] | null> => {
  console.log("=== Fetching allocation requests ===");
  try {
    const { data, error } = await supabase
      .from("allocation_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching allocation requests:", error);
      return null;
    }

    console.log("Raw allocation requests data:", data);
    console.log("Number of allocation requests:", data?.length || 0);
    
    // Type cast the Json fields to proper types
    const typedData = data?.map(item => ({
      ...item,
      personnel_data: item.personnel_data as unknown as QueueItem,
      unit_data: item.unit_data as unknown as DHQLivingUnitWithHousingType,
      status: item.status as 'pending' | 'approved' | 'refused',
    })) || [];
    
    console.log("Processed allocation requests:", typedData);
    return typedData;
  } catch (error) {
    console.error("Unexpected error fetching allocation requests:", error);
    return null;
  }
};

export const createAllocationRequestInDb = async (
  personnel: QueueItem,
  unit: DHQLivingUnitWithHousingType,
  letterId: string
): Promise<AllocationRequest | null> => {
  console.log("=== Creating allocation request in DB ===");
  console.log("Personnel data:", {
    id: personnel.id,
    name: personnel.full_name,
    category: personnel.category,
    rank: personnel.rank,
    svc_no: personnel.svc_no
  });
  console.log("Unit data:", {
    id: unit.id,
    quarter: unit.quarter_name,
    category: unit.category,
    status: unit.status
  });
  console.log("Letter ID:", letterId);
  
  try {
    // Simplify personnel data to avoid JSON serialization issues
    const simplifiedPersonnelData = {
      id: personnel.id,
      full_name: personnel.full_name,
      svc_no: personnel.svc_no,
      rank: personnel.rank,
      category: personnel.category,
      gender: personnel.gender,
      arm_of_service: personnel.arm_of_service,
      marital_status: personnel.marital_status,
      no_of_adult_dependents: personnel.no_of_adult_dependents,
      no_of_child_dependents: personnel.no_of_child_dependents,
      current_unit: personnel.current_unit,
      appointment: personnel.appointment,
      phone: personnel.phone,
      entry_date_time: personnel.entry_date_time,
      sequence: personnel.sequence
    };

    // Simplify unit data to avoid JSON serialization issues
    const simplifiedUnitData = {
      id: unit.id,
      quarter_name: unit.quarter_name,
      location: unit.location,
      block_name: unit.block_name,
      flat_house_room_name: unit.flat_house_room_name,
      category: unit.category,
      no_of_rooms: unit.no_of_rooms,
      status: unit.status,
      housing_type: unit.housing_type ? {
        id: unit.housing_type.id,
        name: unit.housing_type.name,
        description: unit.housing_type.description
      } : null
    };
    
    const insertData = {
      personnel_id: personnel.id,
      unit_id: unit.id,
      letter_id: letterId,
      personnel_data: simplifiedPersonnelData,
      unit_data: simplifiedUnitData,
      status: 'pending' as const,
      allocation_date: new Date().toISOString()
    };
    
    console.log("Simplified insert data:", insertData);

    const { data, error } = await supabase
      .from("allocation_requests")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Supabase error creating allocation request:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        hint: error.hint,
        details: error.details
      });
      return null;
    }

    if (!data) {
      console.error("No data returned from insert operation");
      return null;
    }

    console.log("Created allocation request successfully:", data);
    
    // Type cast the response data
    return {
      ...data,
      personnel_data: data.personnel_data as unknown as QueueItem,
      unit_data: data.unit_data as unknown as DHQLivingUnitWithHousingType,
      status: data.status as 'pending' | 'approved' | 'refused',
    };
  } catch (error) {
    console.error("Unexpected error creating allocation request:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    return null;
  }
};

export const updateAllocationStatus = async (
  requestId: string,
  status: 'approved' | 'refused',
  reason?: string
): Promise<boolean> => {
  console.log(`Updating allocation request ${requestId} to ${status}`);
  try {
    const updateData: any = {
      status,
      approved_at: new Date().toISOString(),
    };

    if (reason) {
      updateData.refusal_reason = reason;
    }

    const { error } = await supabase
      .from("allocation_requests")
      .update(updateData)
      .eq("id", requestId);

    if (error) {
      console.error(`Error ${status === 'approved' ? 'approving' : 'refusing'} allocation:`, error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        hint: error.hint,
        details: error.details
      });
      return false;
    }

    console.log(`Successfully ${status === 'approved' ? 'approved' : 'refused'} allocation request`);
    return true;
  } catch (error) {
    console.error("Unexpected error updating allocation status:", error);
    return false;
  }
};

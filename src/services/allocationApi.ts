
import { supabase } from "@/integrations/supabase/client";
import { QueueItem } from "@/types/queue";
import { DHQLivingUnitWithHousingType } from "@/types/accommodation";
import { AllocationRequest } from "@/types/allocation";

export const generateLetterId = async (): Promise<string | null> => {
  console.log("Generating letter ID...");
  try {
    const { data, error } = await supabase.rpc("generate_letter_id");
    
    if (error) {
      console.error("Error generating letter ID:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        hint: error.hint,
        details: error.details
      });
      return null;
    }
    
    console.log("Generated letter ID:", data);
    return data;
  } catch (error) {
    console.error("Unexpected error generating letter ID:", error);
    return null;
  }
};

export const fetchAllocationRequestsFromDb = async (): Promise<AllocationRequest[] | null> => {
  console.log("Fetching allocation requests...");
  try {
    const { data, error } = await supabase
      .from("allocation_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching allocation requests:", error);
      return null;
    }

    console.log("Fetched allocation requests:", data);
    // Type cast the Json fields to proper types
    const typedData = data?.map(item => ({
      ...item,
      personnel_data: item.personnel_data as unknown as QueueItem,
      unit_data: item.unit_data as unknown as DHQLivingUnitWithHousingType,
      status: item.status as 'pending' | 'approved' | 'refused',
    })) || [];
    
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
  console.log("Creating allocation request in DB...");
  console.log("Personnel:", personnel.full_name, "Category:", personnel.category);
  console.log("Unit:", unit.quarter_name, "Category:", unit.category);
  console.log("Letter ID:", letterId);
  
  try {
    const { data, error } = await supabase
      .from("allocation_requests")
      .insert({
        personnel_id: personnel.id,
        unit_id: unit.id,
        letter_id: letterId,
        personnel_data: personnel as any,
        unit_data: unit as any,
      } as any)
      .select()
      .single();

    if (error) {
      console.error("Error creating allocation request:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        hint: error.hint,
        details: error.details
      });
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

export const removeFromQueue = async (personnelId: string): Promise<boolean> => {
  console.log(`Removing personnel ${personnelId} from queue`);
  try {
    const { error } = await supabase
      .from("queue")
      .delete()
      .eq("id", personnelId);

    if (error) {
      console.error("Error removing from queue:", error);
      return false;
    }

    console.log("Successfully removed from queue");
    return true;
  } catch (error) {
    console.error("Unexpected error removing from queue:", error);
    return false;
  }
};


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
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Error:", error);
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
    console.error("Error:", error);
    return null;
  }
};

export const createAllocationRequestInDb = async (
  personnel: QueueItem,
  unit: DHQLivingUnitWithHousingType,
  letterId: string
): Promise<AllocationRequest | null> => {
  console.log("Creating allocation request in DB...");
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
      return null;
    }

    console.log("Created allocation request:", data);
    
    // Type cast the response data
    return {
      ...data,
      personnel_data: data.personnel_data as unknown as QueueItem,
      unit_data: data.unit_data as unknown as DHQLivingUnitWithHousingType,
      status: data.status as 'pending' | 'approved' | 'refused',
    };
  } catch (error) {
    console.error("Error:", error);
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
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error:", error);
    return false;
  }
};

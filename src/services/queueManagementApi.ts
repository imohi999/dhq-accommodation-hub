
import { supabase } from "@/integrations/supabase/client";
import { QueueItem } from "@/types/queue";

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

export const returnPersonnelToQueueAtPositionOne = async (personnel: QueueItem): Promise<boolean> => {
  console.log(`Returning personnel ${personnel.full_name} to queue at position #1`);
  try {
    const { error } = await supabase.rpc("insert_at_queue_position_one", {
      p_personnel_id: personnel.id,
      p_full_name: personnel.full_name,
      p_svc_no: personnel.svc_no,
      p_gender: personnel.gender,
      p_arm_of_service: personnel.arm_of_service,
      p_category: personnel.category,
      p_rank: personnel.rank,
      p_marital_status: personnel.marital_status,
      p_no_of_adult_dependents: personnel.no_of_adult_dependents,
      p_no_of_child_dependents: personnel.no_of_child_dependents,
      p_current_unit: personnel.current_unit,
      p_appointment: personnel.appointment,
      p_date_tos: personnel.date_tos,
      p_date_sos: personnel.date_sos,
      p_phone: personnel.phone,
    });

    if (error) {
      console.error("Error returning personnel to queue:", error);
      return false;
    }

    console.log("Successfully returned personnel to queue at position #1");
    return true;
  } catch (error) {
    console.error("Unexpected error returning personnel to queue:", error);
    return false;
  }
};

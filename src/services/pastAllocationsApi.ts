
import { supabase } from "@/integrations/supabase/client";

export const fetchPastAllocationsFromDb = async () => {
  console.log("Fetching past allocations...");
  try {
    const { data, error } = await supabase
      .from("past_allocations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching past allocations:", error);
      return null;
    }

    console.log("Fetched past allocations:", data);
    return data || [];
  } catch (error) {
    console.error("Unexpected error fetching past allocations:", error);
    return null;
  }
};

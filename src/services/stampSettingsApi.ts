
import { supabase } from "@/integrations/supabase/client";
import { StampSettings } from "@/types/allocation";

export const fetchStampSettingsFromDb = async (): Promise<StampSettings[]> => {
  console.log("Fetching stamp settings...");
  try {
    const { data, error } = await supabase
      .from("stamp_settings")
      .select("*")
      .eq("is_active", true)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error("Error fetching stamp settings:", error);
      return [];
    }

    console.log("Setting stamp settings:", data);
    return data ? [data] : [];
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
};


import { supabase } from "@/integrations/supabase/client";

export const generateLetterId = async (): Promise<string | null> => {
  console.log("=== Generating letter ID ===");
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

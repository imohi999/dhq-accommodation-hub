
import { supabase } from "@/integrations/supabase/client";

export const generateLetterId = async (): Promise<string | null> => {
  console.log("=== Generating letter ID using database function ===");
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
      
      // Fallback to manual generation if database function fails
      console.log("Attempting fallback letter ID generation...");
      return generateFallbackLetterId();
    }
    
    console.log("Generated letter ID from database function:", data);
    return data;
  } catch (error) {
    console.error("Unexpected error generating letter ID:", error);
    
    // Fallback to manual generation
    console.log("Attempting fallback letter ID generation...");
    return generateFallbackLetterId();
  }
};

const generateFallbackLetterId = (): string => {
  // Generate random 2-digit numbers for the xx/xx part
  const firstPart = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  const secondPart = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  
  const fallbackId = `DHQ/GAR/ABJ/${firstPart}/${secondPart}/LOG`;
  console.log("Generated fallback letter ID:", fallbackId);
  return fallbackId;
};

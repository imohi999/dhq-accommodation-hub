
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
      
      //rAllback to manual generation if database function fails
      console.log("Attempting fallback letter ID generation...");
      return generateFallbackLetterId();
    }
    
    console.log("Generated letter ID from database function:", data);
    
    // Ensure the generated ID follows the correct format
    if (data && data.startsWith('DHQ/GAR/ABJ/') && data.endsWith('/LOG')) {
      return data;
    } else {
      console.warn("Database function returned invalid format, using fallback");
      return generateFallbackLetterId();
    }
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

// Test function to verify letter ID generation
export const testLetterIdGeneration = async (): Promise<void> => {
  console.log("Testing letter ID generation...");
  
  for (let i = 0; i < 5; i++) {
    const letterId = await generateLetterId();
    console.log(`Test ${i + 1}: Generated letter ID:`, letterId);
    
    if (!letterId || !letterId.match(/^DHQ\/GAR\/ABJ\/\d{2}\/\d{2}\/LOG$/)) {
      console.error(`Test ${i + 1} failed: Invalid letter ID format:`, letterId);
    } else {
      console.log(`Test ${i + 1} passed: Valid letter ID format`);
    }
  }
};

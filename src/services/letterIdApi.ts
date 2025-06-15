
export const generateLetterId = async (): Promise<string | null> => {
  console.log("=== Generating letter ID using API ===");
  try {
    const response = await fetch('/api/allocations/generate-letter-id');
    
    if (!response.ok) {
      console.error("Error generating letter ID:", response.statusText);
      console.log("Attempting fallback letter ID generation...");
      return generateFallbackLetterId();
    }
    
    const data = await response.json();
    console.log("Generated letter ID from API:", data.letterId);
    
    return data.letterId;
  } catch (error) {
    console.error("Unexpected error generating letter ID:", error);
    
    // Fallback to manual generation
    console.log("Attempting fallback letter ID generation...");
    return generateFallbackLetterId();
  }
};

const generateFallbackLetterId = (): string => {
  // Generate fallback ID with current year and timestamp
  const year = new Date().getFullYear();
  const randomPart = Date.now().toString().slice(-4);
  
  const fallbackId = `DHQ/ACC/${year}/${randomPart}`;
  console.log("Generated fallback letter ID:", fallbackId);
  return fallbackId;
};

// Test function to verify letter ID generation
export const testLetterIdGeneration = async (): Promise<void> => {
  console.log("Testing letter ID generation...");
  
  for (let i = 0; i < 5; i++) {
    const letterId = await generateLetterId();
    console.log(`Test ${i + 1}: Generated letter ID:`, letterId);
    
    if (!letterId || !letterId.match(/^DHQ\/ACC\/\d{4}\/\d{4}$/)) {
      console.error(`Test ${i + 1} failed: Invalid letter ID format:`, letterId);
    } else {
      console.log(`Test ${i + 1} passed: Valid letter ID format`);
    }
  }
};


import { supabase } from "@/integrations/supabase/client";

export const seedDummyData = async () => {
  console.log("Starting to seed dummy data...");
  
  try {
    // Check if units already exist
    const { data: existingUnits, error: unitsError } = await supabase
      .from("units")
      .select("*")
      .limit(1);

    if (unitsError) {
      console.error("Error checking existing units:", unitsError);
      return false;
    }

    if (existingUnits && existingUnits.length > 0) {
      console.log("Dummy data already exists, skipping seed");
      return true;
    }

    // Insert dummy units
    const { error: unitInsertError } = await supabase
      .from("units")
      .insert([
        { name: "1st Infantry Battalion", description: "Primary infantry unit" },
        { name: "2nd Armored Division", description: "Armored combat unit" },
        { name: "Medical Corps", description: "Healthcare and medical support" },
        { name: "Engineering Corps", description: "Military engineering and construction" }
      ]);

    if (unitInsertError) {
      console.error("Error inserting units:", unitInsertError);
      return false;
    }

    // Insert dummy queue items - fix the array insertion
    const queueItems = [
      {
        full_name: "John Smith",
        svc_no: "12345678",
        gender: "Male",
        arm_of_service: "Army",
        category: "Officer",
        rank: "Lieutenant",
        marital_status: "Single",
        no_of_adult_dependents: 0,
        no_of_child_dependents: 0,
        current_unit: "1st Infantry Battalion",
        phone: "+234-801-234-5678"
      },
      {
        full_name: "Sarah Johnson",
        svc_no: "87654321",
        gender: "Female",
        arm_of_service: "Navy",
        category: "Officer",
        rank: "Commander",
        marital_status: "Married",
        no_of_adult_dependents: 1,
        no_of_child_dependents: 2,
        current_unit: "2nd Armored Division",
        phone: "+234-803-456-7890"
      },
      {
        full_name: "Michael Brown",
        svc_no: "11223344",
        gender: "Male",
        arm_of_service: "Air Force",
        category: "Men",
        rank: "Sergeant",
        marital_status: "Single",
        no_of_adult_dependents: 0,
        no_of_child_dependents: 0,
        current_unit: "Medical Corps",
        phone: "+234-805-678-9012"
      }
    ];

    const { error: queueInsertError } = await supabase
      .from("queue")
      .insert(queueItems);

    if (queueInsertError) {
      console.error("Error inserting queue items:", queueInsertError);
      return false;
    }

    console.log("Dummy data seeded successfully!");
    return true;
  } catch (error) {
    console.error("Unexpected error seeding data:", error);
    return false;
  }
};

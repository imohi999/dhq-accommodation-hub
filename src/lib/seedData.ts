
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
        { name: "Engineering Corps", description: "Military engineering and construction" },
        { name: "Artillery Regiment", description: "Artillery and fire support" }
      ]);

    if (unitInsertError) {
      console.error("Error inserting units:", unitInsertError);
      return false;
    }

    // Insert 10 dummy queue items - 5 Officers and 5 Men
    const queueItems = [
      // Officer Category (5 records)
      {
        sequence: 1,
        full_name: "John Smith",
        svc_no: "N/12345/78",
        gender: "Male",
        arm_of_service: "Navy",
        category: "Officer",
        rank: "Lieutenant Commander",
        marital_status: "Married",
        no_of_adult_dependents: 1,
        no_of_child_dependents: 2,
        current_unit: "Naval Headquarters",
        appointment: "Operations Officer",
        phone: "+234-801-234-5678"
      },
      {
        sequence: 2,
        full_name: "Sarah Johnson",
        svc_no: "AF/87654/21",
        gender: "Female",
        arm_of_service: "Air Force",
        category: "Officer",
        rank: "Squadron Leader",
        marital_status: "Single",
        no_of_adult_dependents: 0,
        no_of_child_dependents: 0,
        current_unit: "Air Force Base",
        appointment: "Flight Commander",
        phone: "+234-803-456-7890"
      },
      {
        sequence: 3,
        full_name: "Michael Brown",
        svc_no: "A/11223/44",
        gender: "Male",
        arm_of_service: "Army",
        category: "Officer",
        rank: "Major",
        marital_status: "Married",
        no_of_adult_dependents: 1,
        no_of_child_dependents: 1,
        current_unit: "1st Infantry Battalion",
        appointment: "Company Commander",
        phone: "+234-805-678-9012"
      },
      {
        sequence: 4,
        full_name: "Grace Adebayo",
        svc_no: "N/55667/89",
        gender: "Female",
        arm_of_service: "Navy",
        category: "Officer",
        rank: "Lieutenant",
        marital_status: "Single",
        no_of_adult_dependents: 0,
        no_of_child_dependents: 0,
        current_unit: "Naval Academy",
        appointment: "Training Officer",
        phone: "+234-807-890-1234"
      },
      {
        sequence: 5,
        full_name: "David Wilson",
        svc_no: "AF/99887/65",
        gender: "Male",
        arm_of_service: "Air Force",
        category: "Officer",
        rank: "Wing Commander",
        marital_status: "Married",
        no_of_adult_dependents: 1,
        no_of_child_dependents: 3,
        current_unit: "Air Defence Command",
        appointment: "Wing Commander",
        phone: "+234-809-012-3456"
      },
      // Men Category (5 records)
      {
        sequence: 6,
        full_name: "Ahmed Ibrahim",
        svc_no: "A/33445/67",
        gender: "Male",
        arm_of_service: "Army",
        category: "Men",
        rank: "Warrant Officer",
        marital_status: "Married",
        no_of_adult_dependents: 1,
        no_of_child_dependents: 2,
        current_unit: "Engineering Corps",
        appointment: "Technical Instructor",
        phone: "+234-811-234-5678"
      },
      {
        sequence: 7,
        full_name: "Joseph Okoro",
        svc_no: "N/77889/01",
        gender: "Male",
        arm_of_service: "Navy",
        category: "Men",
        rank: "Chief Petty Officer",
        marital_status: "Single",
        no_of_adult_dependents: 0,
        no_of_child_dependents: 0,
        current_unit: "Naval Dockyard",
        appointment: "Marine Engineer",
        phone: "+234-813-456-7890"
      },
      {
        sequence: 8,
        full_name: "Emmanuel Okafor",
        svc_no: "AF/22334/56",
        gender: "Male",
        arm_of_service: "Air Force",
        category: "Men",
        rank: "Flight Sergeant",
        marital_status: "Married",
        no_of_adult_dependents: 1,
        no_of_child_dependents: 1,
        current_unit: "Air Force Base",
        appointment: "Aircraft Technician",
        phone: "+234-815-678-9012"
      },
      {
        sequence: 9,
        full_name: "Peter Ugwu",
        svc_no: "A/66778/90",
        gender: "Male",
        arm_of_service: "Army",
        category: "Men",
        rank: "Staff Sergeant",
        marital_status: "Married",
        no_of_adult_dependents: 1,
        no_of_child_dependents: 2,
        current_unit: "Medical Corps",
        appointment: "Medical Assistant",
        phone: "+234-817-890-1234"
      },
      {
        sequence: 10,
        full_name: "Sunday Eze",
        svc_no: "N/44556/78",
        gender: "Male",
        arm_of_service: "Navy",
        category: "Men",
        rank: "Petty Officer",
        marital_status: "Single",
        no_of_adult_dependents: 0,
        no_of_child_dependents: 0,
        current_unit: "Naval Intelligence",
        appointment: "Intelligence Analyst",
        phone: "+234-819-012-3456"
      }
    ];

    const { error: queueInsertError } = await supabase
      .from("queue")
      .insert(queueItems);

    if (queueInsertError) {
      console.error("Error inserting queue items:", queueInsertError);
      return false;
    }

    console.log("Dummy data seeded successfully with 10 records (5 Officers, 5 Men)!");
    return true;
  } catch (error) {
    console.error("Unexpected error seeding data:", error);
    return false;
  }
};

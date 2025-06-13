
import { supabase } from "@/integrations/supabase/client";

export const seedDummyData = async () => {
  console.log("Starting to seed dummy data...");
  
  try {
    // First, seed the queue with 10 records (5 Officers, 5 Men)
    console.log("Seeding queue data...");
    
    // Clear existing queue data to avoid duplicates
    const { error: clearQueueError } = await supabase
      .from("queue")
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

    if (clearQueueError) {
      console.log("Note: Could not clear existing queue data:", clearQueueError);
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

    console.log("Successfully seeded queue with 10 records (5 Officers, 5 Men)!");

    // Now seed sample allocation requests
    console.log("Seeding sample allocation requests...");
    
    const { data: units } = await supabase
      .from("dhq_living_units")
      .select("*")
      .eq("status", "Vacant")
      .limit(3);

    if (units && units.length > 0) {
      const sampleAllocationRequests = [
        {
          personnel_id: crypto.randomUUID(),
          unit_id: units[0].id,
          letter_id: "DHQ/GAR/ABJ/45/12/LOG",
          personnel_data: {
            id: crypto.randomUUID(),
            sequence: 1,
            full_name: "Captain James Rodriguez",
            svc_no: "A/98765/43",
            gender: "Male",
            arm_of_service: "Army",
            category: "Officer",
            rank: "Captain",
            marital_status: "Married",
            no_of_adult_dependents: 1,
            no_of_child_dependents: 2,
            current_unit: "DHQ Garrison",
            appointment: "Staff Officer",
            phone: "+234-802-123-4567",
            entry_date_time: new Date().toISOString()
          },
          unit_data: {
            id: units[0].id,
            quarter_name: units[0].quarter_name,
            location: units[0].location,
            block_name: units[0].block_name,
            flat_house_room_name: units[0].flat_house_room_name,
            category: units[0].category,
            no_of_rooms: units[0].no_of_rooms,
            status: units[0].status
          },
          status: 'pending',
          allocation_date: new Date().toISOString()
        }
      ];

      if (units.length > 1) {
        sampleAllocationRequests.push({
          personnel_id: crypto.randomUUID(),
          unit_id: units[1].id,
          letter_id: "DHQ/GAR/ABJ/67/89/LOG",
          personnel_data: {
            id: crypto.randomUUID(),
            sequence: 2,
            full_name: "Staff Sergeant Paul Okonkwo",
            svc_no: "N/54321/87",
            gender: "Male",
            arm_of_service: "Navy",
            category: "Men",
            rank: "Staff Sergeant",
            marital_status: "Single",
            no_of_adult_dependents: 0,
            no_of_child_dependents: 0,
            current_unit: "Naval Base",
            appointment: "Marine Technician",
            phone: "+234-803-987-6543",
            entry_date_time: new Date().toISOString()
          },
          unit_data: {
            id: units[1].id,
            quarter_name: units[1].quarter_name,
            location: units[1].location,
            block_name: units[1].block_name,
            flat_house_room_name: units[1].flat_house_room_name,
            category: units[1].category,
            no_of_rooms: units[1].no_of_rooms,
            status: units[1].status
          },
          status: 'pending',
          allocation_date: new Date().toISOString()
        });
      }

      const { error: allocationError } = await supabase
        .from("allocation_requests")
        .insert(sampleAllocationRequests);

      if (allocationError) {
        console.error("Error inserting allocation requests:", allocationError);
      } else {
        console.log("Successfully seeded sample allocation requests!");
      }
    }

    // Seed sample past allocations
    console.log("Seeding sample past allocations...");
    
    const samplePastAllocations = [
      {
        personnel_id: crypto.randomUUID(),
        unit_id: crypto.randomUUID(),
        personnel_data: {
          full_name: "Major Thomas Anderson",
          rank: "Major",
          svc_no: "A/11111/22"
        },
        unit_data: {
          quarter_name: "Type B Quarters",
          location: "Block A",
          block_name: "Block A",
          flat_house_room_name: "Flat 1",
          category: "Officer"
        },
        allocation_start_date: "2023-01-15",
        allocation_end_date: "2023-12-31",
        deallocation_date: new Date().toISOString(),
        reason_for_leaving: "Posted to another location",
        letter_id: "DHQ/GAR/ABJ/12/34/LOG"
      },
      {
        personnel_id: crypto.randomUUID(),
        unit_id: crypto.randomUUID(),
        personnel_data: {
          full_name: "Sergeant Mike Johnson",
          rank: "Sergeant",
          svc_no: "N/22222/33"
        },
        unit_data: {
          quarter_name: "Type C Quarters",
          location: "Block B",
          block_name: "Block B",
          flat_house_room_name: "Room 5",
          category: "Men"
        },
        allocation_start_date: "2023-03-01",
        allocation_end_date: "2024-01-15",
        deallocation_date: new Date().toISOString(),
        reason_for_leaving: "Retirement",
        letter_id: "DHQ/GAR/ABJ/56/78/LOG"
      }
    ];

    const { error: pastAllocationError } = await supabase
      .from("past_allocations")
      .insert(samplePastAllocations);

    if (pastAllocationError) {
      console.error("Error inserting past allocations:", pastAllocationError);
    } else {
      console.log("Successfully seeded sample past allocations!");
    }

    // Seed units if they don't exist
    const { data: existingUnits, error: unitsError } = await supabase
      .from("units")
      .select("*")
      .limit(1);

    if (!existingUnits || existingUnits.length === 0) {
      console.log("Seeding units data...");
      
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
      } else {
        console.log("Successfully seeded units!");
      }
    }

    console.log("Dummy data seeding completed successfully!");
    return true;
  } catch (error) {
    console.error("Unexpected error seeding data:", error);
    return false;
  }
};

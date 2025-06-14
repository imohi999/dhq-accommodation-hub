export const seedDummyData = async () => {
  console.log("Starting to seed dummy data...");
  
  try {
    // First, seed the queue with 10 records (5 Officers, 5 Men)
    console.log("Seeding queue data...");
    
    // Note: We can't easily clear existing queue data via API without a bulk delete endpoint
    // For now, we'll just insert new items

    // Insert 10 dummy queue items - 5 Officers and 5 Men
    const queueItems = [
      // Officer Category (5 records)
      {
        fullName: "John Smith",
        svcNo: "N/12345/78",
        gender: "Male",
        armOfService: "Navy",
        category: "Officer",
        rank: "Lieutenant Commander",
        maritalStatus: "Married",
        noOfAdultDependents: 1,
        noOfChildDependents: 2,
        currentUnit: "Naval Headquarters",
        appointment: "Operations Officer",
        phone: "+234-801-234-5678"
      },
      {
        fullName: "Sarah Johnson",
        svcNo: "AF/87654/21",
        gender: "Female",
        armOfService: "Air Force",
        category: "Officer",
        rank: "Squadron Leader",
        maritalStatus: "Single",
        noOfAdultDependents: 0,
        noOfChildDependents: 0,
        currentUnit: "Air Force Base",
        appointment: "Flight Commander",
        phone: "+234-803-456-7890"
      },
      {
        fullName: "Michael Brown",
        svcNo: "A/11223/44",
        gender: "Male",
        armOfService: "Army",
        category: "Officer",
        rank: "Major",
        maritalStatus: "Married",
        noOfAdultDependents: 1,
        noOfChildDependents: 1,
        currentUnit: "1st Infantry Battalion",
        appointment: "Company Commander",
        phone: "+234-805-678-9012"
      },
      {
        fullName: "Grace Adebayo",
        svcNo: "N/55667/89",
        gender: "Female",
        armOfService: "Navy",
        category: "Officer",
        rank: "Lieutenant",
        maritalStatus: "Single",
        noOfAdultDependents: 0,
        noOfChildDependents: 0,
        currentUnit: "Naval Academy",
        appointment: "Training Officer",
        phone: "+234-807-890-1234"
      },
      {
        fullName: "David Wilson",
        svcNo: "AF/99887/65",
        gender: "Male",
        armOfService: "Air Force",
        category: "Officer",
        rank: "Wing Commander",
        maritalStatus: "Married",
        noOfAdultDependents: 1,
        noOfChildDependents: 3,
        currentUnit: "Air Defence Command",
        appointment: "Wing Commander",
        phone: "+234-809-012-3456"
      },
      // Men Category (5 records)
      {
        fullName: "Ahmed Ibrahim",
        svcNo: "A/33445/67",
        gender: "Male",
        armOfService: "Army",
        category: "Men",
        rank: "Warrant Officer",
        maritalStatus: "Married",
        noOfAdultDependents: 1,
        noOfChildDependents: 2,
        currentUnit: "Engineering Corps",
        appointment: "Technical Instructor",
        phone: "+234-811-234-5678"
      },
      {
        fullName: "Joseph Okoro",
        svcNo: "N/77889/01",
        gender: "Male",
        armOfService: "Navy",
        category: "Men",
        rank: "Chief Petty Officer",
        maritalStatus: "Single",
        noOfAdultDependents: 0,
        noOfChildDependents: 0,
        currentUnit: "Naval Dockyard",
        appointment: "Marine Engineer",
        phone: "+234-813-456-7890"
      },
      {
        fullName: "Emmanuel Okafor",
        svcNo: "AF/22334/56",
        gender: "Male",
        armOfService: "Air Force",
        category: "Men",
        rank: "Flight Sergeant",
        maritalStatus: "Married",
        noOfAdultDependents: 1,
        noOfChildDependents: 1,
        currentUnit: "Air Force Base",
        appointment: "Aircraft Technician",
        phone: "+234-815-678-9012"
      },
      {
        fullName: "Peter Ugwu",
        svcNo: "A/66778/90",
        gender: "Male",
        armOfService: "Army",
        category: "Men",
        rank: "Staff Sergeant",
        maritalStatus: "Married",
        noOfAdultDependents: 1,
        noOfChildDependents: 2,
        currentUnit: "Medical Corps",
        appointment: "Medical Assistant",
        phone: "+234-817-890-1234"
      },
      {
        fullName: "Sunday Eze",
        svcNo: "N/44556/78",
        gender: "Male",
        armOfService: "Navy",
        category: "Men",
        rank: "Petty Officer",
        maritalStatus: "Single",
        noOfAdultDependents: 0,
        noOfChildDependents: 0,
        currentUnit: "Naval Intelligence",
        appointment: "Intelligence Analyst",
        phone: "+234-819-012-3456"
      }
    ];

    // Insert queue items via API
    for (const item of queueItems) {
      try {
        const response = await fetch('/api/queue', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(item),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error("Error inserting queue item:", error);
        }
      } catch (error) {
        console.error("Error inserting queue item:", error);
      }
    }

    console.log("Successfully seeded queue with 10 records (5 Officers, 5 Men)!");

    // Fetch some vacant units for allocation requests
    console.log("Fetching vacant units for allocation requests...");
    
    const unitsResponse = await fetch('/api/accommodations?status=Vacant&limit=3');
    const unitsData = await unitsResponse.json();
    const units = unitsData.data || [];

    if (units && units.length > 0) {
      console.log("Seeding sample allocation requests...");
      
      // Transform unit data from camelCase to snake_case for allocation requests
      interface UnitData {
        id: string;
        quarterName: string;
        location: string;
        blockName: string;
        flatHouseRoomName: string;
        category: string;
        noOfRooms: number;
        status: string;
      }
      
      const transformUnit = (unit: UnitData) => ({
        id: unit.id,
        quarter_name: unit.quarterName,
        location: unit.location,
        block_name: unit.blockName,
        flat_house_room_name: unit.flatHouseRoomName,
        category: unit.category,
        no_of_rooms: unit.noOfRooms,
        status: unit.status
      });

      const sampleAllocationRequests = [
        {
          personnelId: crypto.randomUUID(),
          unitId: units[0].id,
          letterId: "DHQ/GAR/ABJ/45/12/LOG",
          personnelData: {
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
          unitData: transformUnit(units[0]),
          status: 'pending',
          allocationDate: new Date().toISOString()
        }
      ];

      if (units.length > 1) {
        sampleAllocationRequests.push({
          personnelId: crypto.randomUUID(),
          unitId: units[1].id,
          letterId: "DHQ/GAR/ABJ/67/89/LOG",
          personnelData: {
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
          unitData: transformUnit(units[1]),
          status: 'pending',
          allocationDate: new Date().toISOString()
        });
      }

      // Insert allocation requests via API
      for (const request of sampleAllocationRequests) {
        try {
          const response = await fetch('/api/allocations/requests', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
          });

          if (!response.ok) {
            const error = await response.json();
            console.error("Error inserting allocation request:", error);
          }
        } catch (error) {
          console.error("Error inserting allocation request:", error);
        }
      }

      console.log("Successfully seeded sample allocation requests!");
    }

    // Seed sample past allocations
    console.log("Seeding sample past allocations...");
    
    const samplePastAllocations = [
      {
        personnelId: crypto.randomUUID(),
        unitId: crypto.randomUUID(),
        personnelData: {
          full_name: "Major Thomas Anderson",
          rank: "Major",
          svc_no: "A/11111/22"
        },
        unitData: {
          quarter_name: "Type B Quarters",
          location: "Block A",
          block_name: "Block A",
          flat_house_room_name: "Flat 1",
          category: "Officer"
        },
        allocationStartDate: "2023-01-15",
        allocationEndDate: "2023-12-31",
        deallocationDate: new Date().toISOString(),
        reasonForLeaving: "Posted to another location",
        letterId: "DHQ/GAR/ABJ/12/34/LOG"
      },
      {
        personnelId: crypto.randomUUID(),
        unitId: crypto.randomUUID(),
        personnelData: {
          full_name: "Sergeant Mike Johnson",
          rank: "Sergeant",
          svc_no: "N/22222/33"
        },
        unitData: {
          quarter_name: "Type C Quarters",
          location: "Block B",
          block_name: "Block B",
          flat_house_room_name: "Room 5",
          category: "Men"
        },
        allocationStartDate: "2023-03-01",
        allocationEndDate: "2024-01-15",
        deallocationDate: new Date().toISOString(),
        reasonForLeaving: "Retirement",
        letterId: "DHQ/GAR/ABJ/56/78/LOG"
      }
    ];

    // Insert past allocations via API
    for (const allocation of samplePastAllocations) {
      try {
        const response = await fetch('/api/allocations/past', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(allocation),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error("Error inserting past allocation:", error);
        }
      } catch (error) {
        console.error("Error inserting past allocation:", error);
      }
    }

    console.log("Successfully seeded sample past allocations!");

    // Check if units exist
    const unitsCheckResponse = await fetch('/api/units?limit=1');
    const unitsCheckData = await unitsCheckResponse.json();

    if (!unitsCheckData || unitsCheckData.length === 0) {
      console.log("Seeding units data...");
      
      const unitsToInsert = [
        { name: "1st Infantry Battalion", description: "Primary infantry unit" },
        { name: "2nd Armored Division", description: "Armored combat unit" },
        { name: "Medical Corps", description: "Healthcare and medical support" },
        { name: "Engineering Corps", description: "Military engineering and construction" },
        { name: "Artillery Regiment", description: "Artillery and fire support" }
      ];

      for (const unit of unitsToInsert) {
        try {
          const response = await fetch('/api/units', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(unit),
          });

          if (!response.ok) {
            const error = await response.json();
            console.error("Error inserting unit:", error);
          }
        } catch (error) {
          console.error("Error inserting unit:", error);
        }
      }

      console.log("Successfully seeded units!");
    }

    console.log("Dummy data seeding completed successfully!");
    return true;
  } catch (error) {
    console.error("Unexpected error seeding data:", error);
    return false;
  }
};
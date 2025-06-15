import { DHQLivingUnitWithHousingType } from "@/types/accommodation";
import { QueueItem } from "@/types/queue";
import { generateLetterId } from "./letterIdApi";
import { fetchAccommodationById, updateAccommodationStatus } from "./accommodationApi";
import { createAllocationRequestInDb } from "./allocationRequestsApi";

export const createTransferAllocationRequest = async (
  currentUnitId: string,
  newUnitId: string,
  personnelName: string,
  personnelRank: string,
  serviceNumber: string
): Promise<boolean> => {
  console.log(`Creating transfer allocation request from unit ${currentUnitId} to unit ${newUnitId}`);
  
  try {
    // Get current unit details
    const currentUnit = await fetchAccommodationById(currentUnitId);

    if (!currentUnit) {
      console.error("Error fetching current unit");
      return false;
    }

    // Get new unit details
    const newUnit = await fetchAccommodationById(newUnitId);

    if (!newUnit) {
      console.error("Error fetching new unit");
      return false;
    }

    // Generate proper letter ID using the database function
    const letterId = await generateLetterId();
    if (!letterId) {
      console.error("Failed to generate letter ID for transfer request");
      return false;
    }

    console.log("Generated letter ID for transfer:", letterId);

    // Generate proper UUID for personnel_id
    const personnelId = crypto.randomUUID();

    // Create comprehensive personnel data object for transfer
    const personnelData = {
      id: personnelId,
      sequence: 1,
      full_name: personnelName,
      svc_no: serviceNumber,
      gender: 'Male',
      arm_of_service: 'Navy',
      category: currentUnit.category,
      rank: personnelRank,
      marital_status: 'Married',
      no_of_adult_dependents: 1,
      no_of_child_dependents: 1,
      current_unit: 'DHQ Garrison',
      appointment: 'Staff Officer',
      phone: '+234-801-000-0000',
      entry_date_time: new Date().toISOString(),
    };

    // Create simplified unit data
    const simplifiedUnitData = {
      id: newUnit.id,
      quarter_name: newUnit.quarterName,
      location: newUnit.location,
      block_name: newUnit.blockName,
      flat_house_room_name: newUnit.flat_house_room_name,
      category: newUnit.category,
      no_of_rooms: newUnit.no_of_rooms,
      status: newUnit.status,
      housing_type: newUnit.housing_type ? {
        id: newUnit.housing_type.id,
        name: newUnit.housing_type.name,
        description: newUnit.housing_type.description
      } : null
    };

    console.log("About to insert allocation request with data:", {
      personnel_id: personnelId,
      unit_id: newUnitId,
      letter_id: letterId,
      status: 'pending'
    });

    // Create allocation request for transfer
    const createdRequest = await createAllocationRequestInDb(
      personnelData as QueueItem, // Type casting as QueueItem for API compatibility
      newUnit,
      letterId
    );

    if (!createdRequest) {
      console.error("Failed to create transfer allocation request");
      return false;
    }

    console.log("Successfully created transfer allocation request:", createdRequest);
    return true;
  } catch (error) {
    console.error("Unexpected error during transfer request creation:", error);
    return false;
  }
};

export const deallocatePersonnelFromUnit = async (
  unitId: string,
  personnelData: {
    name: string;
    rank: string;
    serviceNumber: string;
  },
  unitData: DHQLivingUnitWithHousingType,
  reason?: string
): Promise<boolean> => {
  console.log(`Deallocating personnel from unit ${unitId}`);
  
  try {
    // Simplify unit data for database storage
    const simplifiedUnitData = {
      id: unitData.id,
      quarter_name: unitData.quarterName,
      location: unitData.location,
      block_name: unitData.blockName,
      flat_house_room_name: unitData.flat_house_room_name,
      category: unitData.category,
      no_of_rooms: unitData.no_of_rooms,
      status: unitData.status,
      housing_type: unitData.housing_type ? {
        id: unitData.housing_type.id,
        name: unitData.housing_type.name,
        description: unitData.housing_type.description
      } : null
    };
    
    // Generate a personnel ID since we don't have one from the occupied unit
    const personnelId = crypto.randomUUID();
    
    // Add to past allocations via API with direct deallocation
    const pastAllocationData = {
      directDeallocation: {
        unitId: unitId,
        personnelData: {
          full_name: personnelData.name,
          rank: personnelData.rank,
          svc_no: personnelData.serviceNumber,
        },
        unitData: simplifiedUnitData,
        startDate: unitData.occupancy_start_date || new Date().toISOString()
      },
      reason: reason || 'Manual deallocation'
    };

    const response = await fetch('/api/allocations/past', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pastAllocationData)
    });

    if (!response.ok) {
      console.error("Error adding to past allocations:", response.statusText);
      return false;
    }

    // Clear unit occupancy
    const updated = await updateAccommodationStatus(unitId, {
      status: 'Vacant',
      currentOccupantName: null,
      currentOccupantRank: null,
      currentOccupantServiceNumber: null,
      currentOccupantId: null,
      occupancyStartDate: null,
    });

    if (!updated) {
      console.error("Error clearing unit occupancy");
      return false;
    }

    console.log("Successfully deallocated personnel from unit");
    return true;
  } catch (error) {
    console.error("Unexpected error during deallocation:", error);
    return false;
  }
};

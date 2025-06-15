import { QueueItem } from "@/types/queue";
import { DHQLivingUnitWithHousingType } from "@/types/accommodation";
import { AllocationRequest } from "@/types/allocation";

// API response types
interface AllocationRequestApiResponse {
  id: string;
  personnelId: string;
  unitId: string;
  letterId: string;
  personnelData: QueueItem;
  unitData: DHQLivingUnitWithHousingType;
  allocationDate: string;
  status: 'pending' | 'approved' | 'refused';
  approvedBy?: string | null;
  approvedAt?: string | null;
  refusalReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UpdateAllocationStatusData {
  status: 'approved' | 'refused';
  approvedBy?: string;
  refusalReason?: string;
}

// Fetch allocation requests using the API
export const fetchAllocationRequestsFromDb = async (): Promise<AllocationRequest[] | null> => {
  console.log("=== Fetching allocation requests ===");
  try {
    const response = await fetch('/api/allocations/requests');
    
    if (!response.ok) {
      console.error("Error fetching allocation requests:", response.statusText);
      return null;
    }

    const data = await response.json();
    console.log("Raw allocation requests data:", data);
    console.log("Number of allocation requests:", data?.length || 0);
    
    // Transform the data to match our expected format
    const typedData = data?.map((item: AllocationRequestApiResponse) => ({
      id: item.id,
      personnel_id: item.personnelId,
      unit_id: item.unitId,
      letter_id: item.letterId,
      personnel_data: item.personnelData as QueueItem,
      unit_data: item.unitData as DHQLivingUnitWithHousingType,
      allocation_date: item.allocationDate,
      status: item.status as 'pending' | 'approved' | 'refused',
      approved_by: item.approvedBy,
      approved_at: item.approvedAt,
      refusal_reason: item.refusalReason,
      created_at: item.createdAt,
      updated_at: item.updatedAt
    })) || [];
    
    console.log("Processed allocation requests:", typedData);
    return typedData;
  } catch (error) {
    console.error("Unexpected error fetching allocation requests:", error);
    return null;
  }
};

// Create allocation request using the API
export const createAllocationRequestInDb = async (
  personnel: QueueItem,
  unit: DHQLivingUnitWithHousingType,
  letterId: string
): Promise<AllocationRequest | null> => {
  console.log("=== Creating allocation request via API ===");
  console.log("Personnel data:", {
    id: personnel.id,
    name: personnel.full_name,
    category: personnel.category,
    rank: personnel.rank,
    svc_no: personnel.svc_no
  });
  console.log("Unit data:", {
    id: unit.id,
    quarter: unit.quarterName,
    category: unit.category,
    status: unit.status
  });
  console.log("Letter ID:", letterId);
  
  try {
    // Simplify personnel data to avoid JSON serialization issues
    const simplifiedPersonnelData = {
      id: personnel.id,
      full_name: personnel.full_name,
      svc_no: personnel.svc_no,
      rank: personnel.rank,
      category: personnel.category,
      gender: personnel.gender,
      arm_of_service: personnel.arm_of_service,
      marital_status: personnel.marital_status,
      no_of_adult_dependents: personnel.no_of_adult_dependents,
      no_of_child_dependents: personnel.no_of_child_dependents,
      current_unit: personnel.current_unit,
      appointment: personnel.appointment,
      phone: personnel.phone,
      entry_date_time: personnel.entry_date_time,
      sequence: personnel.sequence
    };

    // Simplify unit data to avoid JSON serialization issues
    const simplifiedUnitData = {
      id: unit.id,
      quarter_name: unit.quarterName,
      location: unit.location,
      block_name: unit.blockName,
      flat_house_room_name: unit.flat_house_room_name,
      category: unit.category,
      no_of_rooms: unit.no_of_rooms,
      status: unit.status,
      housing_type: unit.housing_type ? {
        id: unit.housing_type.id,
        name: unit.housing_type.name,
        description: unit.housing_type.description
      } : null
    };
    
    const requestData = {
      personnelId: personnel.id,
      unitId: unit.id,
      personnelData: simplifiedPersonnelData,
      unitData: simplifiedUnitData
    };
    
    console.log("Simplified request data:", requestData);

    const response = await fetch('/api/allocations/requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      console.error("API error creating allocation request:", response.statusText);
      return null;
    }

    const data = await response.json();
    console.log("Created allocation request successfully:", data);
    
    // Transform the response to match our expected format
    return {
      id: data.id,
      personnel_id: data.personnelId,
      unit_id: data.unitId,
      letter_id: data.letterId,
      personnel_data: data.personnelData as QueueItem,
      unit_data: data.unitData as DHQLivingUnitWithHousingType,
      allocation_date: data.allocationDate,
      status: data.status as 'pending' | 'approved' | 'refused',
      approved_by: data.approvedBy,
      approved_at: data.approvedAt,
      refusal_reason: data.refusalReason,
      created_at: data.createdAt,
      updated_at: data.updatedAt
    };
  } catch (error) {
    console.error("Unexpected error creating allocation request:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    return null;
  }
};

// Update allocation status using the API
export const updateAllocationStatus = async (
  requestId: string,
  status: 'approved' | 'refused',
  reason?: string
): Promise<boolean> => {
  console.log(`Updating allocation request ${requestId} to ${status}`);
  try {
    const updateData: UpdateAllocationStatusData = {
      status,
    };

    if (status === 'approved') {
      // TODO: Get the current user's ID from session
      updateData.approvedBy = 'admin';
    } else if (reason) {
      updateData.refusalReason = reason;
    }

    const response = await fetch(`/api/allocations/requests/${requestId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      console.error(`Error ${status === 'approved' ? 'approving' : 'refusing'} allocation:`, response.statusText);
      return false;
    }

    console.log(`Successfully ${status === 'approved' ? 'approved' : 'refused'} allocation request`);
    return true;
  } catch (error) {
    console.error("Unexpected error updating allocation status:", error);
    return false;
  }
};
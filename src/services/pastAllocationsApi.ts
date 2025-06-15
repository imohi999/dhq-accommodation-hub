
// Transform camelCase API response to snake_case
const transformPastAllocation = (item: any) => ({
  id: item.id,
  personnel_id: item.personnelId,
  unit_id: item.unitId,
  letter_id: item.letterId,
  personnel_data: item.personnelData,
  unit_data: item.unitData,
  allocation_start_date: item.allocationStartDate,
  allocation_end_date: item.allocationEndDate,
  duration_days: item.durationDays,
  reason_for_leaving: item.reasonForLeaving,
  deallocation_date: item.deallocationDate,
  created_at: item.createdAt,
  updated_at: item.updatedAt
});

// Fetch past allocations using the API
export const fetchPastAllocationsFromDb = async () => {
  console.log("Fetching past allocations...");
  try {
    const response = await fetch('/api/allocations/past');
    
    if (!response.ok) {
      console.error("Error fetching past allocations:", response.statusText);
      return null;
    }

    const data = await response.json();
    console.log("Raw past allocations data:", data);
    
    // Transform the data to snake_case
    const transformedData = data?.map(transformPastAllocation) || [];
    console.log("Transformed past allocations:", transformedData);
    
    return transformedData;
  } catch (error) {
    console.error("Unexpected error fetching past allocations:", error);
    return null;
  }
};

// Create past allocation (deallocation)
export const createPastAllocation = async (data: {
  allocationId?: string;
  directDeallocation?: {
    unitId: string;
    personnelData: any;
    unitData: any;
    startDate?: string;
  };
  reason?: string;
  comments?: string;
}) => {
  try {
    const response = await fetch('/api/allocations/past', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      console.error("Error creating past allocation:", response.statusText);
      return null;
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Unexpected error creating past allocation:", error);
    return null;
  }
};

import { useState } from "react";
import useSWR, { mutate as globalMutate } from "swr";
import { toast } from "react-toastify";
import { AllocationRequest } from "@/types/allocation";
import { QueueItem } from "@/types/queue";
import { DHQLivingUnitWithHousingType } from "@/types/accommodation";
import {
  createAllocationRequestInDb,
} from "@/services/allocationRequestsApi";
import { generateLetterId } from "@/services/allocationApi";

// SWR fetcher
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const useAllocationRequestsData = (status?: string) => {
  const [isCreating, setIsCreating] = useState(false);

  // Build URL with status filter if provided
  const url = status 
    ? `/api/allocations/requests?status=${status}`
    : '/api/allocations/requests';

  // Use SWR to fetch allocation requests
  const { data, isLoading, mutate } = useSWR<any[]>(
    url,
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    }
  );

  // Transform the data to match our expected format
  const allocationRequests: AllocationRequest[] = data?.map((item: any) => ({
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
    updated_at: item.updatedAt,
  })) || [];

  const createAllocationRequest = async (
    personnel: QueueItem,
    unit: DHQLivingUnitWithHousingType
  ) => {
    setIsCreating(true);
    
    try {
      console.log("=== Starting allocation request creation ===");
      console.log("Personnel:", personnel);
      console.log("Unit:", unit);
      console.log("Personnel category:", personnel.category);
      console.log("Unit category:", unit.category);
      
      // Validate that categories match
      if (personnel.category !== unit.category) {
        console.error("Category mismatch - Personnel:", personnel.category, "Unit:", unit.category);
        toast.error(`Category Mismatch: Personnel category (${personnel.category}) doesn't match unit category (${unit.category})`);
        return null;
      }
      
      // Generate letter ID
      console.log("Generating letter ID...");
      const letterId = await generateLetterId();
      if (!letterId) {
        console.error("Failed to generate letter ID");
        toast.error("Letter ID Generation Failed: Unable to generate a unique letter ID. Please check the database connection and try again.");
        return null;
      }

      console.log("Letter ID generated:", letterId);

      // Create the allocation request (this will also remove from queue in a transaction)
      console.log("Creating allocation request in database...");
      const result = await createAllocationRequestInDb(personnel, unit, letterId);
      if (!result) {
        console.error("Failed to create allocation request in database");
        toast.error("Database Error: Failed to create allocation request in database. Please check your permissions and try again.");
        return null;
      }

      console.log("Allocation request created successfully:", result);
      console.log("Personnel automatically removed from queue in transaction");

      toast.success(`Allocation request created successfully with letter ID: ${letterId}`);

      // Refresh allocation requests data
      mutate();
      
      // Also invalidate the queue cache to ensure QueueSummaryCards updates
      await globalMutate((key) => typeof key === 'string' && key.startsWith('/api/queue'));
      
      // Invalidate allocation requests cache globally to ensure pending page updates
      await globalMutate((key) => typeof key === 'string' && key.includes('/api/allocations/requests'));
      
      return result;
    } catch (error) {
      console.error("Error in createAllocationRequest:", error);
      toast.error("An unexpected error occurred while creating the allocation request");
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    allocationRequests,
    loading: isLoading || isCreating,
    createAllocationRequest,
    refetch: mutate,
  };
};
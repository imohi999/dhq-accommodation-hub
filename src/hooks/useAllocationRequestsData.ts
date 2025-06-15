import useSWR from "swr";
import { useToast } from "@/hooks/use-toast";
import { AllocationRequest } from "@/types/allocation";
import { QueueItem } from "@/types/queue";
import { DHQLivingUnitWithHousingType } from "@/types/accommodation";
import {
  createAllocationRequestInDb,
} from "@/services/allocationRequestsApi";
import { generateLetterId, removeFromQueue } from "@/services/allocationApi";

// SWR fetcher
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const useAllocationRequestsData = (status?: string) => {
  const { toast } = useToast();

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
    console.log("=== Starting allocation request creation ===");
    console.log("Personnel:", personnel);
    console.log("Unit:", unit);
    console.log("Personnel category:", personnel.category);
    console.log("Unit category:", unit.category);
    
    // Validate that categories match
    if (personnel.category !== unit.category) {
      console.error("Category mismatch - Personnel:", personnel.category, "Unit:", unit.category);
      toast({
        title: "Category Mismatch",
        description: `Personnel category (${personnel.category}) doesn't match unit category (${unit.category})`,
        variant: "destructive",
      });
      return null;
    }
    
    // Generate letter ID
    console.log("Generating letter ID...");
    const letterId = await generateLetterId();
    if (!letterId) {
      console.error("Failed to generate letter ID");
      toast({
        title: "Letter ID Generation Failed",
        description: "Unable to generate a unique letter ID. Please check the database connection and try again.",
        variant: "destructive",
      });
      return null;
    }

    console.log("Letter ID generated:", letterId);

    // Create the allocation request first
    console.log("Creating allocation request in database...");
    const result = await createAllocationRequestInDb(personnel, unit, letterId);
    if (!result) {
      console.error("Failed to create allocation request in database");
      toast({
        title: "Database Error",
        description: "Failed to create allocation request in database. Please check your permissions and try again.",
        variant: "destructive",
      });
      return null;
    }

    console.log("Allocation request created successfully:", result);

    // Only remove personnel from queue after successful allocation request creation
    console.log("Removing personnel from queue...");
    const queueRemovalSuccess = await removeFromQueue(personnel.id);
    if (!queueRemovalSuccess) {
      console.error("Failed to remove personnel from queue");
      toast({
        title: "Warning",
        description: "Allocation request created successfully but failed to remove from queue",
        variant: "destructive",
      });
    } else {
      console.log("Personnel removed from queue successfully");
    }

    toast({
      title: "Success",
      description: `Allocation request created successfully with letter ID: ${letterId}`,
    });

    // Refresh data
    mutate();
    return result;
  };

  return {
    allocationRequests,
    loading: isLoading,
    createAllocationRequest,
    refetch: mutate,
  };
};
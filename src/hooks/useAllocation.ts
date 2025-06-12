
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { AllocationRequest, StampSettings } from "@/types/allocation";
import { QueueItem } from "@/types/queue";
import { DHQLivingUnitWithHousingType } from "@/types/accommodation";
import {
  generateLetterId,
  fetchAllocationRequestsFromDb,
  createAllocationRequestInDb,
  updateAllocationStatus
} from "@/services/allocationApi";
import { fetchStampSettingsFromDb } from "@/services/stampSettingsApi";

export const useAllocation = () => {
  const [allocationRequests, setAllocationRequests] = useState<AllocationRequest[]>([]);
  const [stampSettings, setStampSettings] = useState<StampSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAllocationRequests();
    fetchStampSettings();
  }, []);

  const fetchAllocationRequests = async () => {
    const data = await fetchAllocationRequestsFromDb();
    if (data === null) {
      toast({
        title: "Error",
        description: "Failed to fetch allocation requests",
        variant: "destructive",
      });
    } else {
      setAllocationRequests(data);
    }
    setLoading(false);
  };

  const fetchStampSettings = async () => {
    const data = await fetchStampSettingsFromDb();
    setStampSettings(data);
  };

  const createAllocationRequest = async (
    personnel: QueueItem,
    unit: DHQLivingUnitWithHousingType
  ) => {
    console.log("Creating allocation request...");
    
    // Generate letter ID
    const letterId = await generateLetterId();
    if (!letterId) {
      toast({
        title: "Error",
        description: "Failed to generate letter ID",
        variant: "destructive",
      });
      return null;
    }

    // Create the allocation request
    const result = await createAllocationRequestInDb(personnel, unit, letterId);
    if (!result) {
      toast({
        title: "Error",
        description: "Failed to create allocation request",
        variant: "destructive",
      });
      return null;
    }

    toast({
      title: "Success",
      description: "Allocation request created successfully",
    });

    fetchAllocationRequests();
    return result;
  };

  const approveAllocation = async (requestId: string) => {
    const success = await updateAllocationStatus(requestId, 'approved');
    
    if (success) {
      toast({
        title: "Success",
        description: "Allocation approved successfully",
      });
      fetchAllocationRequests();
    } else {
      toast({
        title: "Error",
        description: "Failed to approve allocation",
        variant: "destructive",
      });
    }
  };

  const refuseAllocation = async (requestId: string, reason: string) => {
    const success = await updateAllocationStatus(requestId, 'refused', reason);
    
    if (success) {
      toast({
        title: "Success",
        description: "Allocation refused",
      });
      fetchAllocationRequests();
    } else {
      toast({
        title: "Error",
        description: "Failed to refuse allocation",
        variant: "destructive",
      });
    }
  };

  return {
    allocationRequests,
    stampSettings,
    loading,
    createAllocationRequest,
    approveAllocation,
    refuseAllocation,
    refetch: fetchAllocationRequests,
  };
};

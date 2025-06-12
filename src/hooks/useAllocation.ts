
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
    console.log("Personnel category:", personnel.category);
    console.log("Unit category:", unit.category);
    
    // Validate that categories match
    if (personnel.category !== unit.category) {
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
      toast({
        title: "Letter ID Generation Failed",
        description: "Unable to generate a unique letter ID. Please check the database connection and try again.",
        variant: "destructive",
      });
      return null;
    }

    console.log("Letter ID generated:", letterId);

    // Create the allocation request
    const result = await createAllocationRequestInDb(personnel, unit, letterId);
    if (!result) {
      toast({
        title: "Database Error",
        description: "Failed to create allocation request in database. Please check your permissions and try again.",
        variant: "destructive",
      });
      return null;
    }

    toast({
      title: "Success",
      description: `Allocation request created successfully with letter ID: ${letterId}`,
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
        description: "Failed to approve allocation. Please check your permissions and try again.",
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
        description: "Failed to refuse allocation. Please check your permissions and try again.",
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

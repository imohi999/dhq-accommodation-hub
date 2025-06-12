import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { AllocationRequest, StampSettings } from "@/types/allocation";
import { QueueItem } from "@/types/queue";
import { DHQLivingUnitWithHousingType } from "@/types/accommodation";
import {
  generateLetterId,
  fetchAllocationRequestsFromDb,
  createAllocationRequestInDb,
  updateAllocationStatus,
  updateUnitOccupancy,
  removeFromQueue,
  returnPersonnelToQueueAtPositionOne
} from "@/services/allocationApi";
import { fetchStampSettingsFromDb } from "@/services/stampSettingsApi";
import { fetchOccupiedUnitsFromDb } from "@/services/occupiedUnitsApi";

export const useAllocation = () => {
  const [allocationRequests, setAllocationRequests] = useState<AllocationRequest[]>([]);
  const [occupiedUnits, setOccupiedUnits] = useState<DHQLivingUnitWithHousingType[]>([]);
  const [stampSettings, setStampSettings] = useState<StampSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAllocationRequests();
    fetchOccupiedUnits();
    fetchStampSettings();
  }, []);

  const fetchAllocationRequests = async () => {
    console.log("Fetching allocation requests...");
    const data = await fetchAllocationRequestsFromDb();
    if (data === null) {
      toast({
        title: "Error",
        description: "Failed to fetch allocation requests",
        variant: "destructive",
      });
    } else {
      console.log("Setting allocation requests:", data);
      setAllocationRequests(data);
    }
  };

  const fetchOccupiedUnits = async () => {
    console.log("Fetching occupied units...");
    const data = await fetchOccupiedUnitsFromDb();
    if (data === null) {
      toast({
        title: "Error",
        description: "Failed to fetch occupied units",
        variant: "destructive",
      });
    } else {
      console.log("Setting occupied units:", data);
      setOccupiedUnits(data);
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

    // Create the allocation request
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

    // Remove personnel from queue immediately upon allocation creation
    console.log("Removing personnel from queue...");
    const queueRemovalSuccess = await removeFromQueue(personnel.id);
    if (!queueRemovalSuccess) {
      console.error("Failed to remove personnel from queue");
      toast({
        title: "Warning",
        description: "Allocation created but failed to remove from queue",
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
    fetchAllocationRequests();
    return result;
  };

  const approveAllocation = async (requestId: string) => {
    // Find the allocation request to get unit and personnel details
    const request = allocationRequests.find(r => r.id === requestId);
    if (!request) {
      toast({
        title: "Error",
        description: "Allocation request not found",
        variant: "destructive",
      });
      return;
    }

    // Update allocation status
    const statusSuccess = await updateAllocationStatus(requestId, 'approved');
    
    if (!statusSuccess) {
      toast({
        title: "Error",
        description: "Failed to approve allocation. Please check your permissions and try again.",
        variant: "destructive",
      });
      return;
    }

    // Update unit occupancy
    const unitSuccess = await updateUnitOccupancy(
      request.unit_id,
      request.personnel_data.full_name,
      request.personnel_data.rank,
      request.personnel_data.svc_no
    );

    if (!unitSuccess) {
      toast({
        title: "Warning",
        description: "Allocation approved but failed to update unit occupancy",
        variant: "destructive",
      });
    }

    toast({
      title: "Success",
      description: "Allocation approved successfully",
    });
    
    fetchAllocationRequests();
    fetchOccupiedUnits(); // Refresh occupied units after approval
  };

  const refuseAllocation = async (requestId: string, reason: string) => {
    // Find the allocation request to get personnel details
    const request = allocationRequests.find(r => r.id === requestId);
    if (!request) {
      toast({
        title: "Error",
        description: "Allocation request not found",
        variant: "destructive",
      });
      return;
    }

    // Update allocation status to refused
    const statusSuccess = await updateAllocationStatus(requestId, 'refused', reason);
    
    if (!statusSuccess) {
      toast({
        title: "Error",
        description: "Failed to refuse allocation. Please check your permissions and try again.",
        variant: "destructive",
      });
      return;
    }

    // Return personnel to queue at position #1 using the new database function
    const returnToQueueSuccess = await returnPersonnelToQueueAtPositionOne(request.personnel_data);
    
    if (!returnToQueueSuccess) {
      toast({
        title: "Warning",
        description: "Allocation refused but failed to return personnel to queue",
        variant: "destructive",
      });
    }

    toast({
      title: "Success",
      description: "Allocation refused and personnel returned to queue at position #1",
    });
    
    fetchAllocationRequests();
  };

  const transferAllocation = async (currentRequestId: string, newUnitId: string) => {
    // Implementation for transfer will be added
    console.log("Transfer allocation:", currentRequestId, "to unit:", newUnitId);
  };

  const deallocatePersonnel = async (requestId: string) => {
    // Implementation for deallocation will be added
    console.log("Deallocate personnel:", requestId);
  };

  return {
    allocationRequests,
    occupiedUnits,
    stampSettings,
    loading,
    createAllocationRequest,
    approveAllocation,
    refuseAllocation,
    transferAllocation,
    deallocatePersonnel,
    refetch: () => {
      fetchAllocationRequests();
      fetchOccupiedUnits();
    },
  };
};

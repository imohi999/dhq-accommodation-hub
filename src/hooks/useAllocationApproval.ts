import { toast } from "react-toastify";
import { AllocationRequest } from "@/types/allocation";
import {
  updateAllocationStatus,
} from "@/services/allocationRequestsApi";
import {
  updateUnitOccupancy,
  returnPersonnelToQueueAtPositionOne
} from "@/services/allocationApi";

export const useAllocationApproval = (
  allocationRequests: AllocationRequest[],
  refetchRequests: () => void
) => {

  const approveAllocation = async (requestId: string) => {
    // Find the allocation request to get unit and personnel details
    const request = allocationRequests.find(r => r.id === requestId);
    if (!request) {
      toast.error("Allocation request not found");
      return;
    }

    // Update allocation status
    const statusSuccess = await updateAllocationStatus(requestId, 'approved');
    
    if (!statusSuccess) {
      toast.error("Failed to approve allocation. Please check your permissions and try again.");
      return;
    }

    // Update unit occupancy - API already handles this in the PATCH endpoint
    // but we'll keep this as a fallback
    const unitSuccess = await updateUnitOccupancy(
      request.unit_id,
      request.personnel_data.full_name,
      request.personnel_data.rank,
      request.personnel_data.svc_no
    );

    if (!unitSuccess) {
      console.warn("Failed to update unit occupancy through direct call, but API should have handled it");
    }

    toast.success("Allocation approved successfully");
    
    refetchRequests();
  };

  const refuseAllocation = async (requestId: string, reason: string) => {
    // Find the allocation request to get personnel details
    const request = allocationRequests.find(r => r.id === requestId);
    if (!request) {
      toast.error("Allocation request not found");
      return;
    }

    // Update allocation status to refused
    const statusSuccess = await updateAllocationStatus(requestId, 'refused', reason);
    
    if (!statusSuccess) {
      toast.error("Failed to refuse allocation. Please check your permissions and try again.");
      return;
    }

    // Return personnel to queue at position #1 using the new database function
    const returnToQueueSuccess = await returnPersonnelToQueueAtPositionOne(request.personnel_data);
    
    if (!returnToQueueSuccess) {
      toast.error("Allocation refused but failed to return personnel to queue");
    }

    toast.success("Allocation refused and personnel returned to queue at position #1");
    
    refetchRequests();
  };

  return {
    approveAllocation,
    refuseAllocation,
  };
};
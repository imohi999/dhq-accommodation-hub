
import { useAllocationRequestsData } from "./useAllocationRequestsData";
import { useAllocationApproval } from "./useAllocationApproval";

export const useAllocationRequests = (status?: string) => {
  const {
    allocationRequests,
    loading,
    createAllocationRequest,
    refetch
  } = useAllocationRequestsData(status);

  const {
    approveAllocation,
    refuseAllocation
  } = useAllocationApproval(allocationRequests, refetch);

  return {
    allocationRequests,
    loading,
    createAllocationRequest,
    approveAllocation,
    refuseAllocation,
    refetch,
  };
};


import { useAllocationRequestsData } from "./useAllocationRequestsData";
import { useAllocationApproval } from "./useAllocationApproval";

export const useAllocationRequests = () => {
  const {
    allocationRequests,
    loading,
    createAllocationRequest,
    refetch
  } = useAllocationRequestsData();

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

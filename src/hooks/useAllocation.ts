
import { useAllocationRequests } from "./useAllocationRequests";
import { useOccupiedUnits } from "./useOccupiedUnits";
import { useStampSettings } from "./useStampSettings";

export const useAllocation = () => {
  const {
    allocationRequests,
    loading: requestsLoading,
    createAllocationRequest,
    approveAllocation,
    refuseAllocation,
    refetch: refetchRequests,
  } = useAllocationRequests();

  const {
    occupiedUnits,
    loading: unitsLoading,
    createTransferRequest,
    refetch: refetchUnits,
  } = useOccupiedUnits();

  const {
    stampSettings,
    refetch: refetchStampSettings,
  } = useStampSettings();

  const loading = requestsLoading || unitsLoading;

  return {
    allocationRequests,
    occupiedUnits,
    stampSettings,
    loading,
    createAllocationRequest,
    approveAllocation,
    refuseAllocation,
    createTransferRequest,
    refetch: () => {
      refetchRequests();
      refetchUnits();
      refetchStampSettings();
    },
  };
};

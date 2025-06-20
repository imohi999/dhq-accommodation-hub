
import { useEffect } from "react";
import { toast } from "react-toastify";
import { useOccupiedUnits as useOccupiedUnitsSWR } from "@/services/occupiedUnitsApi";
import { createTransferAllocationRequest } from "@/services/allocationApi";
import { DHQLivingUnitWithHousingType } from "@/types/accommodation";

export const useOccupiedUnits = () => {
  const { data: occupiedUnits, error, isLoading, mutate } = useOccupiedUnitsSWR();

  const createTransferRequest = async (currentUnitId: string, newUnitId: string) => {
    const currentUnit = occupiedUnits?.find((unit: DHQLivingUnitWithHousingType) => unit.id === currentUnitId);
    if (!currentUnit) {
      toast.error("Current unit not found");
      return false;
    }

    const success = await createTransferAllocationRequest(
      currentUnitId,
      newUnitId,
      currentUnit.current_occupant_name!,
      currentUnit.current_occupant_rank!,
      currentUnit.current_occupant_service_number!
    );

    if (success) {
      toast.success("Transfer request created and sent for approval");
      return true;
    } else {
      toast.error("Failed to create transfer request");
      return false;
    }
  };

  // Show error toast if there's an error
  useEffect(() => {
    if (error && !isLoading) {
      toast.error("Failed to fetch occupied units");
    }
  }, [error, isLoading]);

  return {
    occupiedUnits: occupiedUnits || [],
    loading: isLoading,
    createTransferRequest,
    refetch: mutate,
  };
};

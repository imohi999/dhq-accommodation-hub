
import React, { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useOccupiedUnits as useOccupiedUnitsSWR } from "@/services/occupiedUnitsApi";
import { createTransferAllocationRequest, deallocatePersonnelFromUnit } from "@/services/allocationApi";
import { DHQLivingUnitWithHousingType } from "@/types/accommodation";

export const useOccupiedUnits = () => {
  const { data: occupiedUnits, error, isLoading, mutate } = useOccupiedUnitsSWR();
  const { toast } = useToast();

  const createTransferRequest = async (currentUnitId: string, newUnitId: string) => {
    const currentUnit = occupiedUnits?.find((unit: DHQLivingUnitWithHousingType) => unit.id === currentUnitId);
    if (!currentUnit) {
      toast({
        title: "Error",
        description: "Current unit not found",
        variant: "destructive",
      });
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
      toast({
        title: "Success",
        description: "Transfer request created and sent for approval",
      });
      return true;
    } else {
      toast({
        title: "Error",
        description: "Failed to create transfer request",
        variant: "destructive",
      });
      return false;
    }
  };

  const deallocatePersonnel = async (unitId: string, reason?: string) => {
    const unit = occupiedUnits?.find((u: DHQLivingUnitWithHousingType) => u.id === unitId);
    if (!unit) {
      toast({
        title: "Error",
        description: "Unit not found",
        variant: "destructive",
      });
      return false;
    }

    const success = await deallocatePersonnelFromUnit(
      unitId,
      {
        name: unit.current_occupant_name!,
        rank: unit.current_occupant_rank!,
        serviceNumber: unit.current_occupant_service_number!,
      },
      unit,
      reason
    );

    if (success) {
      toast({
        title: "Success",
        description: "Personnel deallocated successfully",
      });
      mutate(); // Refresh data
      return true;
    } else {
      toast({
        title: "Error",
        description: "Failed to deallocate personnel",
        variant: "destructive",
      });
      return false;
    }
  };

  // Show error toast if there's an error
  useEffect(() => {
    if (error && !isLoading) {
      toast({
        title: "Error",
        description: "Failed to fetch occupied units",
        variant: "destructive",
      });
    }
  }, [error, isLoading, toast]);

  return {
    occupiedUnits: occupiedUnits || [],
    loading: isLoading,
    createTransferRequest,
    deallocatePersonnel,
    refetch: mutate,
  };
};

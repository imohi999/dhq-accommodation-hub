
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { DHQLivingUnitWithHousingType } from "@/types/accommodation";
import { fetchOccupiedUnitsFromDb } from "@/services/occupiedUnitsApi";
import { createTransferAllocationRequest, deallocatePersonnelFromUnit } from "@/services/allocationApi";

export const useOccupiedUnits = () => {
  const [occupiedUnits, setOccupiedUnits] = useState<DHQLivingUnitWithHousingType[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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

  const createTransferRequest = async (currentUnitId: string, newUnitId: string) => {
    const currentUnit = occupiedUnits.find(unit => unit.id === currentUnitId);
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
    const unit = occupiedUnits.find(u => u.id === unitId);
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
      fetchOccupiedUnits(); // Refresh data
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

  useEffect(() => {
    fetchOccupiedUnits();
  }, []);

  return {
    occupiedUnits,
    loading,
    createTransferRequest,
    deallocatePersonnel,
    refetch: fetchOccupiedUnits,
  };
};

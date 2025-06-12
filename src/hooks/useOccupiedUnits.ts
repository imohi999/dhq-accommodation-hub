
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { DHQLivingUnitWithHousingType } from "@/types/accommodation";
import { fetchOccupiedUnitsFromDb } from "@/services/occupiedUnitsApi";

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

  const transferAllocation = async (currentRequestId: string, newUnitId: string) => {
    // Implementation for transfer will be added
    console.log("Transfer allocation:", currentRequestId, "to unit:", newUnitId);
  };

  const deallocatePersonnel = async (requestId: string) => {
    // Implementation for deallocation will be added
    console.log("Deallocate personnel:", requestId);
  };

  useEffect(() => {
    fetchOccupiedUnits();
  }, []);

  return {
    occupiedUnits,
    loading,
    transferAllocation,
    deallocatePersonnel,
    refetch: fetchOccupiedUnits,
  };
};

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AllocationRequest, StampSettings } from "@/types/allocation";
import { QueueItem } from "@/types/queue";
import { DHQLivingUnitWithHousingType } from "@/types/accommodation";

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
    console.log("Fetching allocation requests...");
    try {
      const { data, error } = await supabase
        .from("allocation_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching allocation requests:", error);
        toast({
          title: "Error",
          description: "Failed to fetch allocation requests",
          variant: "destructive",
        });
        return;
      }

      console.log("Setting allocation requests:", data);
      // Type cast the Json fields to proper types
      const typedData = data?.map(item => ({
        ...item,
        personnel_data: item.personnel_data as unknown as QueueItem,
        unit_data: item.unit_data as unknown as DHQLivingUnitWithHousingType,
        status: item.status as 'pending' | 'approved' | 'refused',
      })) || [];
      
      setAllocationRequests(typedData);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStampSettings = async () => {
    console.log("Fetching stamp settings...");
    try {
      const { data, error } = await supabase
        .from("stamp_settings")
        .select("*")
        .eq("is_active", true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching stamp settings:", error);
        return;
      }

      console.log("Setting stamp settings:", data);
      setStampSettings(data ? [data] : []);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const createAllocationRequest = async (
    personnel: QueueItem,
    unit: DHQLivingUnitWithHousingType
  ) => {
    console.log("Creating allocation request...");
    try {
      // Generate letter ID
      const { data: letterIdData, error: letterIdError } = await supabase
        .rpc("generate_letter_id");

      if (letterIdError) {
        console.error("Error generating letter ID:", letterIdError);
        toast({
          title: "Error",
          description: "Failed to generate letter ID",
          variant: "destructive",
        });
        return null;
      }

      const { data, error } = await supabase
        .from("allocation_requests")
        .insert({
          personnel_id: personnel.id,
          unit_id: unit.id,
          letter_id: letterIdData,
          personnel_data: personnel as any,
          unit_data: unit as any,
        } as any)
        .select()
        .single();

      if (error) {
        console.error("Error creating allocation request:", error);
        toast({
          title: "Error",
          description: "Failed to create allocation request",
          variant: "destructive",
        });
        return null;
      }

      console.log("Created allocation request:", data);
      toast({
        title: "Success",
        description: "Allocation request created successfully",
      });

      fetchAllocationRequests();
      
      // Type cast the response data
      return {
        ...data,
        personnel_data: data.personnel_data as unknown as QueueItem,
        unit_data: data.unit_data as unknown as DHQLivingUnitWithHousingType,
        status: data.status as 'pending' | 'approved' | 'refused',
      };
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return null;
    }
  };

  const approveAllocation = async (requestId: string) => {
    console.log("Approving allocation request:", requestId);
    try {
      const { error } = await supabase
        .from("allocation_requests")
        .update({
          status: "approved",
          approved_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (error) {
        console.error("Error approving allocation:", error);
        toast({
          title: "Error",
          description: "Failed to approve allocation",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Allocation approved successfully",
      });

      fetchAllocationRequests();
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const refuseAllocation = async (requestId: string, reason: string) => {
    console.log("Refusing allocation request:", requestId);
    try {
      const { error } = await supabase
        .from("allocation_requests")
        .update({
          status: "refused",
          refusal_reason: reason,
          approved_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (error) {
        console.error("Error refusing allocation:", error);
        toast({
          title: "Error",
          description: "Failed to refuse allocation",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Allocation refused",
      });

      fetchAllocationRequests();
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
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


import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { QueueItem, Unit, QueueFormData } from "@/types/queue";

export const useQueueForm = (item: QueueItem | null, onSubmit: () => void) => {
  const [formData, setFormData] = useState<QueueFormData>({
    full_name: "",
    svc_no: "",
    gender: "",
    arm_of_service: "",
    category: "",
    rank: "",
    marital_status: "",
    no_of_adult_dependents: 0,
    no_of_child_dependents: 0,
    current_unit: "",
    appointment: "",
    date_tos: "",
    date_sos: "",
    phone: "",
  });
  
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUnits();
    if (item) {
      setFormData({
        full_name: item.full_name,
        svc_no: item.svc_no,
        gender: item.gender,
        arm_of_service: item.arm_of_service,
        category: item.category,
        rank: item.rank,
        marital_status: item.marital_status,
        no_of_adult_dependents: item.no_of_adult_dependents,
        no_of_child_dependents: item.no_of_child_dependents,
        current_unit: item.current_unit || "",
        appointment: item.appointment || "",
        date_tos: item.date_tos || "",
        date_sos: item.date_sos || "",
        phone: item.phone || "",
      });
    }
  }, [item]);

  const fetchUnits = async () => {
    try {
      const { data, error } = await supabase
        .from("units")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching units:", error);
        return;
      }

      setUnits(data || []);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Reset rank when arm of service or category changes
    if (field === "arm_of_service" || field === "category") {
      setFormData(prev => ({
        ...prev,
        [field]: value,
        rank: ""
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        full_name: formData.full_name,
        svc_no: formData.svc_no,
        gender: formData.gender,
        arm_of_service: formData.arm_of_service,
        category: formData.category,
        rank: formData.rank,
        marital_status: formData.marital_status,
        no_of_adult_dependents: Number(formData.no_of_adult_dependents),
        no_of_child_dependents: Number(formData.no_of_child_dependents),
        current_unit: formData.current_unit || null,
        appointment: formData.appointment || null,
        date_tos: formData.date_tos || null,
        date_sos: formData.date_sos || null,
        phone: formData.phone || null,
      };

      let error;
      if (item) {
        // Update existing item
        ({ error } = await supabase
          .from("queue")
          .update(payload)
          .eq("id", item.id));
      } else {
        // Create new item - don't include sequence as it's auto-generated
        ({ error } = await supabase
          .from("queue")
          .insert([payload]));
      }

      if (error) {
        console.error("Error saving queue item:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to save queue item",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: `Queue item ${item ? 'updated' : 'created'} successfully`,
      });

      onSubmit();
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

  return {
    formData,
    units,
    loading,
    handleInputChange,
    handleSubmit
  };
};

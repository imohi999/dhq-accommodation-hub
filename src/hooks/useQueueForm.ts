
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { QueueItem, Unit, QueueFormData, Dependent } from "@/types/queue";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface UnitResponse {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

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
    dependents: [],
    current_unit: "",
    appointment: "",
    date_tos: "",
    date_sos: "",
    phone: "",
  });
  
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch units using SWR
  const { data: unitsData, error: unitsError, mutate: refetchUnits } = useSWR<UnitResponse[]>(
    '/api/units',
    fetcher
  );

  useEffect(() => {
    if (unitsError) {
      console.error("Error fetching units:", unitsError);
    }
  }, [unitsError]);

  useEffect(() => {
    if (unitsData) {
      // Transform API response to match expected format
      const transformedUnits = unitsData.map((unit) => ({
        id: unit.id,
        name: unit.name,
        description: unit.description,
        createdAt: unit.createdAt,
      }));
      setUnits(transformedUnits);
    }
  }, [unitsData]);

  useEffect(() => {
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
        dependents: item.dependents || [],
        current_unit: item.current_unit || "",
        appointment: item.appointment || "",
        date_tos: item.date_tos || "",
        date_sos: item.date_sos || "",
        phone: item.phone || "",
      });
    }
  }, [item]);

  const handleInputChange = (field: string, value: string | number | Dependent[]) => {
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

    // Update dependent counts when dependents array changes
    if (field === "dependents" && Array.isArray(value)) {
      const adultCount = value.filter(d => d.age >= 18).length;
      const childCount = value.filter(d => d.age < 18).length;
      setFormData(prev => ({
        ...prev,
        dependents: value,
        no_of_adult_dependents: adultCount,
        no_of_child_dependents: childCount
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Transform to camelCase for API
      const payload = {
        fullName: formData.full_name,
        svcNo: formData.svc_no,
        gender: formData.gender,
        armOfService: formData.arm_of_service,
        category: formData.category,
        rank: formData.rank,
        maritalStatus: formData.marital_status,
        noOfAdultDependents: Number(formData.no_of_adult_dependents),
        noOfChildDependents: Number(formData.no_of_child_dependents),
        dependents: formData.dependents || [],
        currentUnit: formData.current_unit || null,
        appointment: formData.appointment || null,
        dateTos: formData.date_tos || null,
        dateSos: formData.date_sos || null,
        phone: formData.phone || null,
      };

      let response;
      if (item) {
        // Update existing item
        response = await fetch(`/api/queue/${item.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new item
        response = await fetch('/api/queue', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || error.message || "Failed to save queue item");
      }

      toast.success(`Queue item ${item ? 'updated' : 'created'} successfully`);

      onSubmit();
    } catch (error) {
      console.error("Error saving queue item:", error);
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    units,
    loading,
    handleInputChange,
    handleSubmit,
    refetchUnits
  };
};

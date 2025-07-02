
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { QueueItem, Unit, QueueFormData, Dependent } from "@/types/queue";
import useSWR from "swr";
import { getRankOptions } from "@/constants/ranks";

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
    gender: "", // Will be selected from dropdown
    arm_of_service: "", // Will be selected from dropdown
    category: "", // Will be selected from dropdown
    rank: "", // Will be selected from dropdown
    marital_status: "", // Will be selected from dropdown
    no_of_adult_dependents: 0,
    no_of_child_dependents: 0,
    dependents: [],
    current_unit: "",
    appointment: "",
    date_tos: "",
    date_sos: "",
    phone: "",
    image_url: "",
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
      // Helper function to format date for HTML date input
      const formatDateForInput = (dateString: string | null) => {
        if (!dateString) return "";
        try {
          const date = new Date(dateString);
          // Format as YYYY-MM-DD for HTML date input
          return date.toISOString().split('T')[0];
        } catch {
          return dateString || "";
        }
      };

      const formValues = {
        full_name: item.full_name || "",
        svc_no: item.svc_no || "",
        gender: item.gender || "",
        arm_of_service: item.arm_of_service || "",
        category: item.category || "",
        rank: item.rank || "",
        marital_status: item.marital_status || "",
        no_of_adult_dependents: item.no_of_adult_dependents || 0,
        no_of_child_dependents: item.no_of_child_dependents || 0,
        dependents: item.dependents || [],
        current_unit: item.current_unit || "",
        appointment: item.appointment || "",
        date_tos: formatDateForInput(item.date_tos),
        date_sos: formatDateForInput(item.date_sos),
        phone: item.phone || "",
        image_url: item.image_url || "",
      };
      
      // Debug logging to check values
      console.log("Setting form data for edit:", {
        itemId: item.id,
        gender: item.gender,
        arm_of_service: item.arm_of_service,
        category: item.category,
        rank: item.rank,
        marital_status: item.marital_status,
        formValues
      });
      
      setFormData(formValues);
    }
  }, [item]);

  const handleInputChange = (field: string, value: string | number | Dependent[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Reset rank when arm of service or category changes only if the current rank is not valid
    if (field === "arm_of_service" || field === "category") {
      const newArmOfService = field === "arm_of_service" ? value as string : formData.arm_of_service;
      const newCategory = field === "category" ? value as string : formData.category;
      
      // Check if current rank is valid for the new combination
      const validRanks = getRankOptions(newArmOfService, newCategory);
      const currentRankIsValid = validRanks.includes(formData.rank);
      
      setFormData(prev => ({
        ...prev,
        [field]: value,
        // Only reset rank if it's not valid for the new combination
        rank: currentRankIsValid ? prev.rank : ""
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
    
    // Validate required fields
    if (!formData.full_name) {
      toast.error("Full Name is required");
      return;
    }
    
    if (!formData.svc_no) {
      toast.error("Service Number is required");
      return;
    }
    
    if (!formData.gender) {
      toast.error("Gender is required");
      return;
    }
    
    if (!formData.arm_of_service) {
      toast.error("Arm of Service is required");
      return;
    }
    
    if (!formData.category) {
      toast.error("Category is required");
      return;
    }
    
    if (!formData.rank) {
      toast.error("Rank is required");
      return;
    }
    
    if (!formData.marital_status) {
      toast.error("Marital Status is required");
      return;
    }
    
    if (!formData.current_unit) {
      toast.error("Current Unit is required");
      return;
    }
    
    if (!formData.date_tos) {
      toast.error("Date TOS is required");
      return;
    }
    
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
        imageUrl: formData.image_url || null,
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

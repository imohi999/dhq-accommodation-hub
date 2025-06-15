
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { QueueItem, Unit } from "@/types/queue";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Type for API response
interface QueueResponse {
  id: string;
  sequence: number;
  fullName: string;
  svcNo: string;
  gender: string;
  armOfService: string;
  category: string;
  rank: string;
  maritalStatus: string;
  noOfAdultDependents: number;
  noOfChildDependents: number;
  currentUnit: string | null;
  appointment: string | null;
  dateTos: string | null;
  dateSos: string | null;
  phone: string | null;
  entryDateTime: string;
  createdAt: string;
  updatedAt: string;
}

interface UnitResponse {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

export const useQueueData = () => {
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const { toast } = useToast();

  // Fetch queue items
  const { data: queueData, error: queueError, isLoading: queueLoading, mutate: fetchQueueItems } = useSWR<QueueResponse[]>(
    '/api/queue',
    fetcher
  );

  // Fetch units
  const { data: unitsData, error: unitsError, isLoading: unitsLoading } = useSWR<UnitResponse[]>(
    '/api/units',
    fetcher
  );

  useEffect(() => {
    if (queueError) {
      console.error("Error fetching queue items:", queueError);
      toast({
        title: "Error",
        description: "Failed to fetch queue items",
        variant: "destructive",
      });
    }
  }, [queueError, toast]);

  useEffect(() => {
    if (unitsError) {
      console.error("Error fetching units:", unitsError);
    }
  }, [unitsError]);

  useEffect(() => {
    if (queueData) {
      console.log("Fetching queue items...");
      console.log("Queue items fetch result:", { data: queueData });
      
      // Transform API response to match expected format
      const transformedQueue = queueData.map((item) => ({
        id: item.id,
        sequence: item.sequence,
        full_name: item.fullName,
        svc_no: item.svcNo,
        gender: item.gender,
        arm_of_service: item.armOfService,
        category: item.category,
        rank: item.rank,
        marital_status: item.maritalStatus,
        no_of_adult_dependents: item.noOfAdultDependents,
        no_of_child_dependents: item.noOfChildDependents,
        current_unit: item.currentUnit,
        appointment: item.appointment,
        date_tos: item.dateTos,
        date_sos: item.dateSos,
        phone: item.phone,
        entry_date_time: item.entryDateTime,
        created_at: item.createdAt,
        updated_at: item.updatedAt,
      }));
      
      console.log("Setting queue items:", transformedQueue);
      setQueueItems(transformedQueue);
    }
  }, [queueData]);

  useEffect(() => {
    if (unitsData) {
      console.log("Fetching units...");
      console.log("Units fetch result:", { data: unitsData });
      
      // Transform API response to match expected format
      const transformedUnits = unitsData.map((unit) => ({
        id: unit.id,
        name: unit.name,
        description: unit.description,
        createdAt: unit.createdAt,
      }));
      
      console.log("Setting units:", transformedUnits);
      setUnits(transformedUnits);
    }
  }, [unitsData]);

  const loading = queueLoading || unitsLoading;

  return {
    queueItems,
    units,
    loading,
    fetchQueueItems
  };
};


import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { QueueItem, Unit } from "@/types/queue";

export const useQueueData = () => {
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchQueueItems();
    fetchUnits();
  }, []);

  const fetchQueueItems = async () => {
    console.log("Fetching queue items...");
    try {
      const { data, error } = await supabase
        .from("queue")
        .select("*")
        .order("sequence", { ascending: true });

      console.log("Queue items fetch result:", { data, error });

      if (error) {
        console.error("Error fetching queue items:", error);
        toast({
          title: "Error",
          description: "Failed to fetch queue items",
          variant: "destructive",
        });
        return;
      }

      console.log("Setting queue items:", data);
      setQueueItems(data || []);
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

  const fetchUnits = async () => {
    console.log("Fetching units...");
    try {
      const { data, error } = await supabase
        .from("units")
        .select("*")
        .order("name");

      console.log("Units fetch result:", { data, error });

      if (error) {
        console.error("Error fetching units:", error);
        return;
      }

      console.log("Setting units:", data);
      setUnits(data || []);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return {
    queueItems,
    units,
    loading,
    fetchQueueItems
  };
};

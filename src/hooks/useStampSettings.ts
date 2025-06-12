
import { useState, useEffect } from "react";
import { StampSettings } from "@/types/allocation";
import { fetchStampSettingsFromDb } from "@/services/stampSettingsApi";

export const useStampSettings = () => {
  const [stampSettings, setStampSettings] = useState<StampSettings[]>([]);

  const fetchStampSettings = async () => {
    const data = await fetchStampSettingsFromDb();
    setStampSettings(data);
  };

  useEffect(() => {
    fetchStampSettings();
  }, []);

  return {
    stampSettings,
    refetch: fetchStampSettings,
  };
};

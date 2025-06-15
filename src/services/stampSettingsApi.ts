
import { StampSettings } from "@/types/allocation";
import useSWR, { mutate } from "swr";

// API response type for stamp settings
interface ApiStampSetting {
  id: string;
  stampName: string;
  stampRank: string;
  stampAppointment: string;
  stampNote?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch stamp settings");
  }
  return response.json();
};

// Transform API response to match our expected format
const transformStampSetting = (item: ApiStampSetting): StampSettings => ({
  id: item.id,
  stamp_name: item.stampName,
  stamp_rank: item.stampRank,
  stamp_appointment: item.stampAppointment,
  stamp_note: item.stampNote,
  is_active: item.isActive,
  created_at: item.createdAt,
  updated_at: item.updatedAt
});

// Hook to fetch stamp settings using SWR
export const useStampSettings = () => {
  const { data, error, mutate: swrMutate } = useSWR<ApiStampSetting[]>(
    '/api/stamp-settings',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const transformedData = data?.map(transformStampSetting) || [];

  return {
    data: transformedData,
    error,
    isLoading: !error && !data,
    mutate: swrMutate,
  };
};

// Hook to fetch only active stamp settings
export const useActiveStampSettings = () => {
  const { data, error, isLoading, mutate } = useStampSettings();
  
  const activeSettings = data?.filter(setting => setting.is_active) || [];
  
  return {
    data: activeSettings,
    error,
    isLoading,
    mutate,
  };
};

// Legacy function for backward compatibility - fetches only active stamp settings
export const fetchStampSettingsFromDb = async (): Promise<StampSettings[]> => {
  console.log("Fetching stamp settings...");
  try {
    const response = await fetch('/api/stamp-settings');
    
    if (!response.ok) {
      console.error("Error fetching stamp settings:", response.statusText);
      return [];
    }

    const data: ApiStampSetting[] = await response.json();
    const transformedData = data.map(transformStampSetting);
    
    // Filter for active settings only (matching the original behavior)
    const activeSettings = transformedData.filter(setting => setting.is_active);
    
    console.log("Setting stamp settings:", activeSettings);
    return activeSettings;
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
};

// Create new stamp setting
export const createStampSetting = async (stampData: {
  stamp_name: string;
  stamp_rank: string;
  stamp_appointment: string;
  stamp_note?: string;
  is_active?: boolean;
}): Promise<StampSettings | null> => {
  try {
    const requestData = {
      stampName: stampData.stamp_name,
      stampRank: stampData.stamp_rank,
      stampAppointment: stampData.stamp_appointment,
      stampNote: stampData.stamp_note,
      isActive: stampData.is_active
    };

    const response = await fetch('/api/stamp-settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      console.error("Error creating stamp setting:", response.statusText);
      return null;
    }

    const apiResponse: ApiStampSetting = await response.json();
    
    // Invalidate the cache
    await mutate('/api/stamp-settings');

    return transformStampSetting(apiResponse);
  } catch (error) {
    console.error("Unexpected error creating stamp setting:", error);
    return null;
  }
};

// Update stamp setting
export const updateStampSetting = async (
  id: string,
  updates: Partial<{
    stamp_name: string;
    stamp_rank: string;
    stamp_appointment: string;
    stamp_note: string;
    is_active: boolean;
  }>
): Promise<StampSettings | null> => {
  try {
    const requestData: Partial<{
      stampName: string;
      stampRank: string;
      stampAppointment: string;
      stampNote: string;
      isActive: boolean;
    }> = {};
    if (updates.stamp_name !== undefined) requestData.stampName = updates.stamp_name;
    if (updates.stamp_rank !== undefined) requestData.stampRank = updates.stamp_rank;
    if (updates.stamp_appointment !== undefined) requestData.stampAppointment = updates.stamp_appointment;
    if (updates.stamp_note !== undefined) requestData.stampNote = updates.stamp_note;
    if (updates.is_active !== undefined) requestData.isActive = updates.is_active;

    const response = await fetch(`/api/stamp-settings/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      console.error("Error updating stamp setting:", response.statusText);
      return null;
    }

    const apiResponse: ApiStampSetting = await response.json();
    
    // Invalidate the cache
    await mutate('/api/stamp-settings');

    return transformStampSetting(apiResponse);
  } catch (error) {
    console.error("Unexpected error updating stamp setting:", error);
    return null;
  }
};

// Delete stamp setting
export const deleteStampSetting = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/stamp-settings/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      console.error("Error deleting stamp setting:", response.statusText);
      return false;
    }

    // Invalidate the cache
    await mutate('/api/stamp-settings');

    return true;
  } catch (error) {
    console.error("Unexpected error deleting stamp setting:", error);
    return false;
  }
};

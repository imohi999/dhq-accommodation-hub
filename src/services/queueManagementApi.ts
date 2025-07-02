
import { QueueItem } from "@/types/queue";
import useSWR, { mutate } from "swr";

// API response type for queue items
interface ApiQueueItem {
  id: string;
  fullName: string;
  svcNo: string;
  gender: string;
  armOfService: string;
  category: string;
  rank: string;
  maritalStatus: string;
  noOfAdultDependents: number;
  noOfChildDependents: number;
  currentUnit?: string | null;
  appointment?: string | null;
  dateTos?: string | null;
  dateSos?: string | null;
  phone?: string | null;
  imageUrl?: string | null;
  sequence: number;
  entryDateTime: string;
  createdAt: string;
  updatedAt: string;
}

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch queue data");
  }
  return response.json();
};

// Transform API response to match our expected format
const transformQueueItem = (item: ApiQueueItem): QueueItem => ({
  id: item.id,
  full_name: item.fullName,
  svc_no: item.svcNo,
  gender: item.gender,
  arm_of_service: item.armOfService,
  category: item.category,
  rank: item.rank,
  marital_status: item.maritalStatus,
  no_of_adult_dependents: item.noOfAdultDependents,
  no_of_child_dependents: item.noOfChildDependents,
  current_unit: item.currentUnit || null,
  appointment: item.appointment || null,
  date_tos: item.dateTos || null,
  date_sos: item.dateSos || null,
  phone: item.phone || null,
  image_url: item.imageUrl || null,
  sequence: item.sequence,
  entry_date_time: item.entryDateTime || item.createdAt
});

// Hook to fetch queue data using SWR
export const useQueue = (filters?: {
  search?: string;
  gender?: string;
  category?: string;
  maritalStatus?: string;
}) => {
  const queryParams = new URLSearchParams();
  if (filters?.search) queryParams.append('search', filters.search);
  if (filters?.gender) queryParams.append('gender', filters.gender);
  if (filters?.category) queryParams.append('category', filters.category);
  if (filters?.maritalStatus) queryParams.append('maritalStatus', filters.maritalStatus);

  const url = `/api/queue${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  const { data, error, mutate: swrMutate } = useSWR<ApiQueueItem[]>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const transformedData = data?.map(transformQueueItem) || [];

  return {
    data: transformedData,
    error,
    isLoading: !error && !data,
    mutate: swrMutate,
  };
};

// Remove from queue
export const removeFromQueue = async (personnelId: string): Promise<boolean> => {
  console.log(`Removing personnel ${personnelId} from queue`);
  try {
    const response = await fetch(`/api/queue/${personnelId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      console.error("Error removing from queue:", response.statusText);
      return false;
    }

    // Invalidate the queue cache
    await mutate(key => typeof key === 'string' && key.startsWith('/api/queue'));

    console.log("Successfully removed from queue");
    return true;
  } catch (error) {
    console.error("Unexpected error removing from queue:", error);
    return false;
  }
};

// Return personnel to queue at position #1
export const returnPersonnelToQueueAtPositionOne = async (personnel: QueueItem): Promise<boolean> => {
  console.log(`Returning personnel ${personnel.full_name} to queue at position #1`);
  try {
    const requestData = {
      personnelId: personnel.id,
      fullName: personnel.full_name,
      svcNo: personnel.svc_no,
      gender: personnel.gender,
      armOfService: personnel.arm_of_service,
      category: personnel.category,
      rank: personnel.rank,
      maritalStatus: personnel.marital_status,
      noOfAdultDependents: personnel.no_of_adult_dependents,
      noOfChildDependents: personnel.no_of_child_dependents,
      currentUnit: personnel.current_unit || '',
      appointment: personnel.appointment || '',
      dateTos: personnel.date_tos || '',
      dateSos: personnel.date_sos || '',
      phone: personnel.phone || '',
      imageUrl: personnel.image_url || null,
    };

    const response = await fetch('/api/queue/insert-at-position-one', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      console.error("Error returning personnel to queue:", response.statusText);
      return false;
    }

    // Invalidate the queue cache
    await mutate(key => typeof key === 'string' && key.startsWith('/api/queue'));

    console.log("Successfully returned personnel to queue at position #1");
    return true;
  } catch (error) {
    console.error("Unexpected error returning personnel to queue:", error);
    return false;
  }
};

// Add new person to queue (at the end)
export const addToQueue = async (queueData: Omit<QueueItem, 'id' | 'sequence' | 'entry_date_time'>): Promise<QueueItem | null> => {
  console.log(`Adding new personnel ${queueData.full_name} to queue`);
  try {
    const requestData = {
      fullName: queueData.full_name,
      svcNo: queueData.svc_no,
      gender: queueData.gender,
      armOfService: queueData.arm_of_service,
      category: queueData.category,
      rank: queueData.rank,
      maritalStatus: queueData.marital_status,
      noOfAdultDependents: queueData.no_of_adult_dependents,
      noOfChildDependents: queueData.no_of_child_dependents,
      currentUnit: queueData.current_unit || '',
      appointment: queueData.appointment || '',
      dateTos: queueData.date_tos || '',
      dateSos: queueData.date_sos || '',
      phone: queueData.phone || '',
      imageUrl: queueData.image_url || null,
    };

    const response = await fetch('/api/queue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      console.error("Error adding to queue:", response.statusText);
      return null;
    }

    const apiResponse: ApiQueueItem = await response.json();
    
    // Invalidate the queue cache
    await mutate(key => typeof key === 'string' && key.startsWith('/api/queue'));

    console.log("Successfully added to queue");
    return transformQueueItem(apiResponse);
  } catch (error) {
    console.error("Unexpected error adding to queue:", error);
    return null;
  }
};

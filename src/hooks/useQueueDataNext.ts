import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { QueueItem } from '@/types/queue'
import { useEffect } from 'react'

interface QueueFilters {
  search?: string
  gender?: string
  category?: string
  maritalStatus?: string
  page?: number
  limit?: number
}

// API returns camelCase properties
interface ApiQueueItem {
  id: string
  fullName: string
  svcNo: string
  gender: string
  armOfService: string
  category: string
  rank: string
  maritalStatus: string
  noOfAdultDependents: number
  noOfChildDependents: number
  currentUnit?: string | null
  appointment?: string | null
  dateTos?: string | null
  dateSos?: string | null
  phone?: string | null
  sequence: number
  entryDateTime: string
  createdAt: string
  updatedAt: string
}

interface QueueOptions {
  refetchInterval?: number | false
  refetchIntervalInBackground?: boolean
}

// Fetch queue data with auto-refresh
export function useQueueData(filters: QueueFilters = {}, options: QueueOptions = {}) {
  return useQuery<ApiQueueItem[]>({
    queryKey: ['queue', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString())
      })

      const response = await fetch(`/api/queue?${params}`)
      if (!response.ok) throw new Error('Failed to fetch queue')
      return response.json()
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: options.refetchInterval !== undefined ? options.refetchInterval : 30000, // Default 30s auto-refresh
    refetchIntervalInBackground: options.refetchIntervalInBackground ?? false,
  })
}

// Create queue entry
export function useCreateQueueEntry() {
  const queryClient = useQueryClient()

  return useMutation<QueueItem, Error, Partial<QueueItem>>({
    mutationFn: async (data) => {
      const response = await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create entry')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queue'] })
      toast.success('Queue entry created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Update queue entry
export function useUpdateQueueEntry() {
  const queryClient = useQueryClient()

  return useMutation<QueueItem, Error, { id: string; data: Partial<QueueItem> }>({
    mutationFn: async ({ id, data }) => {
      const response = await fetch(`/api/queue/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to update entry')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queue'] })
      toast.success('Queue entry updated successfully')
    },
    onError: () => {
      toast.error('Failed to update queue entry')
    },
  })
}

// Delete queue entry
export function useDeleteQueueEntry() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const response = await fetch(`/api/queue/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete entry')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queue'] })
      toast.success('Queue entry deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete queue entry')
    },
  })
}

// Optional: Use Server-Sent Events for real-time updates
export function useQueueSSE(enabled = false) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!enabled) return

    const eventSource = new EventSource('/api/queue/events')

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      if (data.type === 'queue:update') {
        queryClient.invalidateQueries({ queryKey: ['queue'] })
      }
    }

    eventSource.onerror = () => {
      console.error('SSE connection error')
      eventSource.close()
      
      // Optionally retry connection after a delay
      setTimeout(() => {
        if (enabled) {
          eventSource.close()
          // Recursively call this effect
        }
      }, 5000)
    }

    return () => {
      eventSource.close()
    }
  }, [queryClient, enabled])
}
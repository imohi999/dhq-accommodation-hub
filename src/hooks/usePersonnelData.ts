import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'

export interface PersonnelRecord {
  id: string
  sequence: number
  fullName: string
  svcNo: string
  gender: string
  armOfService: string
  category: string
  rank: string
  maritalStatus: string
  noOfAdultDependents: number
  noOfChildDependents: number
  dependents?: Array<{
    name: string
    gender: string
    age: number
  }>
  currentUnit: string | null
  appointment: string | null
  dateTos: string | null
  dateSos: string | null
  phone: string | null
  entryDateTime: string
  createdAt: string
  updatedAt: string
}

// Fetch all personnel records
export const usePersonnelData = (
  params: Record<string, string> = {},
  options = {}
) => {
  return useQuery({
    queryKey: ['personnel', params],
    queryFn: async (): Promise<PersonnelRecord[]> => {
      const searchParams = new URLSearchParams(params)
      const response = await fetch(`/api/personnel?${searchParams}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch personnel records')
      }
      
      return response.json()
    },
    ...options,
  })
}

// Create personnel record
export const useCreatePersonnel = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: any): Promise<PersonnelRecord> => {
      const response = await fetch('/api/personnel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create personnel record')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personnel'] })
      toast.success('Personnel record created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Update personnel record
export const useUpdatePersonnel = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }): Promise<PersonnelRecord> => {
      const response = await fetch(`/api/personnel/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update personnel record')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personnel'] })
      toast.success('Personnel record updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Delete personnel record with cascading delete
export const useDeletePersonnel = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/personnel/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete personnel record')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personnel'] })
      toast.success('Personnel record deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Fetch single personnel record
export const usePersonnelRecord = (id: string) => {
  return useQuery({
    queryKey: ['personnel', id],
    queryFn: async (): Promise<PersonnelRecord> => {
      const response = await fetch(`/api/personnel/${id}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch personnel record')
      }
      
      return response.json()
    },
    enabled: !!id,
  })
}
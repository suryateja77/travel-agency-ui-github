import { generateAPIMethods } from '@api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const { get, getById, create, updateById, delete: deleteById } = generateAPIMethods('/advanced-booking')

export const useAdvancedBookingsQuery = () => {
  return useQuery({
    queryKey: ['advancedBookings'],
    queryFn: async () => {
      const response = await get({})
      return response.data
    },
  })
}

export const useAdvanceBookingByIdQuery = (id: string) => {
  return useQuery({
    queryKey: ['advanceBooking', id],
    queryFn: async () => {
      const response = await getById({ _id: id })
      return response.data
    },
    enabled: !!id,
  })
}

export const useCreateAdvanceBookingMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (advanceBookingData: Record<string, any>) => {
      await create({ ...advanceBookingData })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advancedBookings'] })
    },
  })
}

export const useUpdateAdvanceBookingMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ _id, ...advanceBookingData }: Record<string, any>) => {
      await updateById({ _id, ...advanceBookingData })
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['advancedBookings'] })
      if (variables && variables._id) {
        queryClient.invalidateQueries({ queryKey: ['advanceBooking', variables._id] })
      }
    },
  })
}

export const useDeleteAdvanceBookingMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: String) => {
      await deleteById({ _id: id })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advancedBookings'] })
    },
  })
}

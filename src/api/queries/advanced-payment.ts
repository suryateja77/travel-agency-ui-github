import { generateAPIMethods } from '@api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const { get, getById, create, updateById, delete: deleteById } = generateAPIMethods('/advanced-payment')

export const useAdvancedPaymentsQuery = () => {
  return useQuery({
    queryKey: ['advancedPayments'],
    queryFn: async () => {
      const response = await get({})
      return response.data
    },
  })
}

export const useAdvancePaymentByIdQuery = (id: string) => {
  return useQuery({
    queryKey: ['advancePayment', id],
    queryFn: async () => {
      const response = await getById({ _id: id })
      return response.data
    },
    enabled: !!id,
  })
}

export const useCreateAdvancePaymentMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (advancePaymentData: Record<string, any>) => {
      await create({ ...advancePaymentData })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advancedPayments'] })
    },
  })
}

export const useUpdateAdvancePaymentMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ _id, ...advancePaymentData }: Record<string, any>) => {
      await updateById({ _id, ...advancePaymentData })
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['advancedPayments'] })
      if (variables && variables._id) {
        queryClient.invalidateQueries({ queryKey: ['advancePayment', variables._id] })
      }
    },
  })
}

export const useDeleteAdvancePaymentMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: String) => {
      await deleteById({ _id: id })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advancedPayments'] })
    },
  })
}

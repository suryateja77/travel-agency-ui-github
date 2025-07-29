import { generateAPIMethods } from '@api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const { get, getById, create, updateById, delete: deleteById } = generateAPIMethods('/customer')

export const useCustomersQuery = () => {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const response = await get({})
      return response.data
    },
  })
}

export const useCustomerByIdQuery = (id: string) => {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      const response = await getById({ _id: id })
      return response.data
    },
    enabled: !!id,
  })
}

export const useCreateCustomerMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (customerData: Record<string, any>) => {
      await create({ ...customerData })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}

export const useUpdateCustomerMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ _id, ...customerData }: Record<string, any>) => {
      await updateById({ _id, ...customerData })
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      if (variables && variables._id) {
        queryClient.invalidateQueries({ queryKey: ['customer', variables._id] })
      }
    },
  })
}

export const useDeleteCustomerMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: String) => {
      await deleteById({ _id: id })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}

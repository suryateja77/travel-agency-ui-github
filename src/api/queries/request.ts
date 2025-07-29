import { generateAPIMethods } from '@api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const { get, getById, create, updateById, delete: deleteById } = generateAPIMethods('/request')

export const useRequestsQuery = () => {
  return useQuery({
    queryKey: ['requests'],
    queryFn: async () => {
      const response = await get({})
      return response.data
    },
  })
}

export const useRequestByIdQuery = (id: string) => {
  return useQuery({
    queryKey: ['request', id],
    queryFn: async () => {
      const response = await getById({ _id: id })
      return response.data
    },
    enabled: !!id,
  })
}

export const useCreateRequestMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (requestData: Record<string, any>) => {
      await create({ ...requestData })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
    },
  })
}

export const useUpdateRequestMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ _id, ...requestData }: Record<string, any>) => {
      await updateById({ _id, ...requestData })
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      if (variables && variables._id) {
        queryClient.invalidateQueries({ queryKey: ['request', variables._id] })
      }
    },
  })
}

export const useDeleteRequestMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: String) => {
      await deleteById({ _id: id })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
    },
  })
}

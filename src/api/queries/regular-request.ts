import { generateAPIMethods } from '@api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const { get, getById, create, updateById, delete: deleteById } = generateAPIMethods('/regular-request')

export const useRegularRequestsQuery = () => {
  return useQuery({
    queryKey: ['regularRequests'],
    queryFn: async () => {
      const response = await get({})
      return response.data
    },
  })
}

export const useRegularRequestByIdQuery = (id: string) => {
  return useQuery({
    queryKey: ['regularRequest', id],
    queryFn: async () => {
      const response = await getById({ _id: id })
      return response.data
    },
    enabled: !!id,
  })
}

export const useCreateRegularRequestMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (regularRequestData: Record<string, any>) => {
      await create({ ...regularRequestData })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regularRequests'] })
    },
  })
}

export const useUpdateRegularRequestMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ _id, ...regularRequestData }: Record<string, any>) => {
      await updateById({ _id, ...regularRequestData })
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['regularRequests'] })
      if (variables && variables._id) {
        queryClient.invalidateQueries({ queryKey: ['regularRequest', variables._id] })
      }
    },
  })
}

export const useDeleteRegularRequestMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: String) => {
      await deleteById({ _id: id })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regularRequests'] })
    },
  })
}

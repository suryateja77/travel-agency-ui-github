import { generateAPIMethods } from '@api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const { get, getById, create, updateById, delete: deleteById } = generateAPIMethods('/configuration')

export const useConfigurationsQuery = () => {
  return useQuery({
    queryKey: ['configurations'],
    queryFn: async () => {
      const response = await get({})
      return response.data
    },
    staleTime: 1000 * 60 * 30,  // Configs stay fresh for 30 minutes
    refetchOnWindowFocus: false, // Prevent refetch on tab focus
    gcTime: 1000 * 60 * 60,  // Cached for 1 hour even if unused
  })
}

export const useConfigurationByIdQuery = (id: string) => {
  return useQuery({
    queryKey: ['configuration', id],
    queryFn: async () => {
      const response = await getById({ _id: id })
      return response.data
    },
    enabled: !!id,
  })
}

export const useCreateConfigurationMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (configData: Record<string, any>) => {
      await create({ ...configData })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configurations'] })
    },
  })
}

export const useUpdateConfigurationMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ _id, ...configData }: Record<string, any>) => {
      await updateById({ _id, ...configData })
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['configurations'] })
      if (variables && variables._id) {
        queryClient.invalidateQueries({ queryKey: ['configuration', variables._id] })
      }
    },
  })
}

export const useDeleteConfigurationMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await deleteById({ _id: id })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configurations'] })
    },
  })
}

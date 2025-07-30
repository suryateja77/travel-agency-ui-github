import { generateAPIMethods } from '@api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const { get, create, updateById, delete: deleteById } = generateAPIMethods('/app-config')

export const useAppConfigsQuery = () => {
  return useQuery({
    queryKey: ['appConfigs'],
    queryFn: async () => {
      const response = await get({})
      return response.data
    },
  })
}

export const useCreateAppConfigMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (appConfigData: Record<string, any>) => {
      await create({ ...appConfigData })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appConfigs'] })
    },
  })
}

export const useUpdateAppConfigMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ _id, ...appConfigData }: Record<string, any>) => {
      await updateById({ _id, ...appConfigData })
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appConfigs'] })
      if (variables && variables._id) {
        queryClient.invalidateQueries({ queryKey: ['appConfig', variables._id] })
      }
    },
  })
}

export const useDeleteAppConfigMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ _id, ...appConfigData }: Record<string, any>) => {
      await deleteById({ _id, ...appConfigData })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appConfigs'] })
    },
  })
}

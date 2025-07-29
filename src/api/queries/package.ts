import { generateAPIMethods } from '@api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const { get, getById, create, updateById, delete: deleteById } = generateAPIMethods('/package')

export const usePackagesQuery = () => {
  return useQuery({
    queryKey: ['packages'],
    queryFn: async () => {
      const response = await get({})
      return response.data
    },
  })
}

export const usePackageByIdQuery = (id: string) => {
  return useQuery({
    queryKey: ['package', id],
    queryFn: async () => {
      const response = await getById({ _id: id })
      return response.data
    },
    enabled: !!id,
  })
}

export const useCreatePackageMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (packageData: Record<string, any>) => {
      await create({ ...packageData })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] })
    },
  })
}

export const useUpdatePackageMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ _id, ...packageData }: Record<string, any>) => {
      await updateById({ _id, ...packageData })
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['packages'] })
      if (variables && variables._id) {
        queryClient.invalidateQueries({ queryKey: ['package', variables._id] })
      }
    },
  })
}

export const useDeletePackageMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: String) => {
      await deleteById({ _id: id })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] })
    },
  })
}

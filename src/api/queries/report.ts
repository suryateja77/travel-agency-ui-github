import { generateAPIMethods } from '@api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const { get, getById, create, updateById, delete: deleteById } = generateAPIMethods('/report')

export const useReportsQuery = () => {
  return useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const response = await get({})
      return response.data
    },
  })
}

export const useReportByIdQuery = (id: string) => {
  return useQuery({
    queryKey: ['report', id],
    queryFn: async () => {
      const response = await getById({ _id: id })
      return response.data
    },
    enabled: !!id,
  })
}

export const useCreateReportMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (reportData: Record<string, any>) => {
      await create({ ...reportData })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}

export const useUpdateReportMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ _id, ...reportData }: Record<string, any>) => {
      await updateById({ _id, ...reportData })
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      if (variables && variables._id) {
        queryClient.invalidateQueries({ queryKey: ['report', variables._id] })
      }
    },
  })
}

export const useDeleteReportMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: String) => {
      await deleteById({ _id: id })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}

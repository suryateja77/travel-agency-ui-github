import { generateAPIMethods } from '@api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const { get, getById, create, updateById, delete: deleteById } = generateAPIMethods('/staff')

export const useStaffsQuery = () => {
  return useQuery({
    queryKey: ['staffs'],
    queryFn: async () => {
      const response = await get({})
      return response.data
    },
  })
}

export const useStaffByIdQuery = (id: string) => {
  return useQuery({
    queryKey: ['staff', id],
    queryFn: async () => {
      const response = await getById({ _id: id })
      return response.data
    },
    enabled: !!id,
  })
}

export const useCreateStaffMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (staffData: Record<string, any>) => {
      await create({ ...staffData })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffs'] })
    },
  })
}

export const useUpdateStaffMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ _id, ...staffData }: Record<string, any>) => {
      await updateById({ _id, ...staffData })
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['staffs'] })
      if (variables && variables._id) {
        queryClient.invalidateQueries({ queryKey: ['staff', variables._id] })
      }
    },
  })
}

export const useDeleteStaffMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: String) => {
      await deleteById({ _id: id })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffs'] })
    },
  })
}

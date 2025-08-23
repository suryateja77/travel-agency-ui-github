import { generateAPIMethods } from '@api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const { get, getById, create, updateById, delete: deleteById, getByCategory } = generateAPIMethods('/vehicle')

export const useVehiclesQuery = () => {
  return useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const response = await get({})
      return response.data
    },
  })
}

export const useVehicleByCategory = (category: string) => {
  return useQuery({
    queryKey: ['vehicles', category],
    queryFn: async () => {
      const response = await getByCategory({ category })
      return response.data
    },
    enabled: !!category,
  })
}

export const useVehicleByIdQuery = (id: string) => {
  return useQuery({
    queryKey: ['vehicle', id],
    queryFn: async () => {
      const response = await getById({ _id: id })
      return response.data
    },
    enabled: !!id,
  })
}

export const useCreateVehicleMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (vehicleData: Record<string, any>) => {
      await create({ ...vehicleData })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
    },
  })
}

export const useUpdateVehicleMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ _id, ...vehicleData }: Record<string, any>) => {
      await updateById({ _id, ...vehicleData })
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      if (variables && variables._id) {
        queryClient.invalidateQueries({ queryKey: ['vehicle', variables._id] })
      }
    },
  })
}

export const useDeleteVehicleMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: String) => {
      await deleteById({ _id: id })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
    },
  })
}

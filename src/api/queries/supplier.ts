import { generateAPIMethods } from '@api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const { get, getById, create, updateById, delete: deleteById, getByCategory } = generateAPIMethods('/supplier')

export const useSuppliersQuery = () => {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const response = await get({})
      return response.data
    },
  })
}

export const useSupplierByCategory = (category: string) => {
  return useQuery({
    queryKey: ['suppliers', category],
    queryFn: async () => {
      const response = await getByCategory({ category })
      return response.data
    },
    enabled: !!category,
  })
}

export const useSupplierByIdQuery = (id: string) => {
  return useQuery({
    queryKey: ['supplier', id],
    queryFn: async () => {
      const response = await getById({ _id: id })
      return response.data
    },
    enabled: !!id,
  })
}

export const useCreateSupplierMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (supplierData: Record<string, any>) => {
      await create({ ...supplierData })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
    },
  })
}

export const useUpdateSupplierMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ _id, ...supplierData }: Record<string, any>) => {
      await updateById({ _id, ...supplierData })
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      if (variables && variables._id) {
        queryClient.invalidateQueries({ queryKey: ['supplier', variables._id] })
      }
    },
  })
}

export const useDeleteSupplierMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: String) => {
      await deleteById({ _id: id })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
    },
  })
}

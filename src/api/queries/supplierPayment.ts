import { generateAPIMethods } from '@api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const { get, getById, create, updateById, exportExcel, exportCsv, exportPdf } = generateAPIMethods('/supplier-payment')

// Query to fetch all supplier payments with optional filters
export const useSupplierPaymentsQuery = (filters?: Record<string, any>) => {
  return useQuery({
    queryKey: ['supplier-payments', filters],
    queryFn: async () => {
      const response = await get({ params: filters })
      return response.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Query to fetch single supplier payment by ID
export const useSupplierPaymentByIdQuery = (id: string) => {
  return useQuery({
    queryKey: ['supplier-payment', id],
    queryFn: async () => {
      const response = await getById({ _id: id })
      return response.data
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

// Mutation to create supplier payment
export const useCreateSupplierPaymentMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const response = await create(data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-payments'] })
    },
  })
}

// Mutation to update supplier payment
export const useUpdateSupplierPaymentMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const response = await updateById(data)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['supplier-payments'] })
      queryClient.invalidateQueries({ queryKey: ['supplier-payment', variables._id] })
    },
  })
}

// Export mutations
export const useExportSupplierPaymentsExcel = () => {
  return useMutation({
    mutationFn: async (filters?: Record<string, any>) => {
      const response = await exportExcel({ params: filters })
      return response.data
    },
  })
}

export const useExportSupplierPaymentsCsv = () => {
  return useMutation({
    mutationFn: async (filters?: Record<string, any>) => {
      const response = await exportCsv({ params: filters })
      return response.data
    },
  })
}

export const useExportSupplierPaymentsPdf = () => {
  return useMutation({
    mutationFn: async (filters?: Record<string, any>) => {
      const response = await exportPdf({ params: filters })
      return response.data
    },
  })
}

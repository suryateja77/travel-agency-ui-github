import { generateAPIMethods } from '@api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const { get, getById, create, updateById, delete: deleteById, exportExcel, exportCsv } = generateAPIMethods('/fixed-vehicle-payment')

export const useFixedVehiclePaymentsQuery = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ['fixedVehiclePayments', params],
    queryFn: async () => {
      let queryParams: Record<string, any> = {}

      if (params && Object.keys(params).length > 0) {
        const { month, year, ...filters } = params
        if (month !== undefined) {
          queryParams.month = month
        }
        if (year !== undefined) {
          queryParams.year = year
        }
        // Add remaining filters as filterData
        if (Object.keys(filters).length > 0) {
          queryParams.filterData = filters
        }
      }

      const response = await get({ params: queryParams })
      return response.data
    },
  })
}

export const useFixedVehiclePaymentByIdQuery = (id: string) => {
  return useQuery({
    queryKey: ['fixedVehiclePayment', id],
    queryFn: async () => {
      const response = await getById({ _id: id })
      return response.data
    },
    enabled: !!id,
  })
}

export const useCreateFixedVehiclePaymentMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (fixedVehiclePaymentData: Record<string, any>) => {
      await create({ ...fixedVehiclePaymentData })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixedVehiclePayments'] })
    },
  })
}

export const useUpdateFixedVehiclePaymentMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ _id, ...fixedVehiclePaymentData }: Record<string, any>) => {
      await updateById({ _id, ...fixedVehiclePaymentData })
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['fixedVehiclePayments'] })
      if (variables && variables._id) {
        queryClient.invalidateQueries({ queryKey: ['fixedVehiclePayment', variables._id] })
      }
    },
  })
}

export const useDeleteFixedVehiclePaymentMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: String) => {
      await deleteById({ _id: id })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixedVehiclePayments'] })
    },
  })
}

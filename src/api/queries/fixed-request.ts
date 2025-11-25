import { generateAPIMethods, get } from '@api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const { get: getFixedRequest, getById, create, updateById, delete: deleteById, exportExcel, exportCsv } = generateAPIMethods('/fixed-request')

// Custom API method for fetching by vehicle, month, and year
const getByMonthYear = (vehicle: string, month: string | number, year: string | number) => {
  const apiUrl = `/fixed-request/${vehicle}/${month}/${year}`
  return get(apiUrl)
}

export const useFixedRequestsQuery = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ['fixedRequests', params],
    queryFn: async () => {
      let queryParams: Record<string, any> = {}

      if (params && Object.keys(params).length > 0) {
        const { page, limit, ...filters } = params
        if (page !== undefined) {
          queryParams.page = page
        }
        if (limit !== undefined) {
          queryParams.limit = limit
        }
        // Add remaining filters as filterData
        if (Object.keys(filters).length > 0) {
          queryParams.filterData = filters
        }
      }

      const response = await getFixedRequest({ params: queryParams })
      return response.data
    },
  })
}

export const useFixedRequestByIdQuery = (id: string) => {
  return useQuery({
    queryKey: ['fixedRequest', id],
    queryFn: async () => {
      const response = await getById({ _id: id })
      return response.data
    },
    enabled: !!id,
  })
}

// Query for fetching by vehicle, month, and year
export const useFixedRequestByMonthYearQuery = (vehicle: string, month: string | number, year: string | number) => {
  return useQuery({
    queryKey: ['fixedRequests', vehicle, month, year],
    queryFn: async () => {
      const response = await getByMonthYear(vehicle, month, year)
      return response.data
    },
    enabled: !!vehicle && !!month && !!year,
  })
}

export const useCreateFixedRequestMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (fixedRequestData: Record<string, any>) => {
      await create({ ...fixedRequestData })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixedRequests'] })
      queryClient.invalidateQueries({ queryKey: ['fixedVehiclePayments'] })
      queryClient.invalidateQueries({ queryKey: ['staffAccounts'] })
    },
  })
}

export const useUpdateFixedRequestMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ _id, ...fixedRequestData }: Record<string, any>) => {
      await updateById({ _id, ...fixedRequestData })
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['fixedRequests'] })
      queryClient.invalidateQueries({ queryKey: ['fixedVehiclePayments'] })
      queryClient.invalidateQueries({ queryKey: ['staffAccounts'] })
      if (variables && variables._id) {
        queryClient.invalidateQueries({ queryKey: ['fixedRequest', variables._id] })
      }
    },
  })
}

export const useDeleteFixedRequestMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: String) => {
      await deleteById({ _id: id })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixedRequests'] })
      queryClient.invalidateQueries({ queryKey: ['fixedVehiclePayments'] })
      queryClient.invalidateQueries({ queryKey: ['staffAccounts'] })
    },
  })
}

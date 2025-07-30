import { generateAPIMethods, get } from '@api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const { get: getFixedRequest, getById, create, updateById, delete: deleteById } = generateAPIMethods('/fixed-request')

// Custom API method for fetching by vehicle, month, and year
const getByMonthYear = (vehicle: string, month: string | number, year: string | number) => {
  const apiUrl = `/fixed-request/${vehicle}/${month}/${year}`
  return get(apiUrl)
}

export const useFixedRequestsQuery = () => {
  return useQuery({
    queryKey: ['fixedRequests'],
    queryFn: async () => {
      const response = await getFixedRequest({})
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
      if (variables && variables._id) {
        queryClient.invalidateQueries({ queryKey: ['fixedRequest', variables._id] })
      }
    },
  })
}

export const useDeleteFixedRequestMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ _id, ...fixedRequestData }: Record<string, any>) => {
      await deleteById({ _id, ...fixedRequestData })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixedRequests'] })
    },
  })
}

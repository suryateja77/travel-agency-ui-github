import { generateAPIMethods } from '@api'
import { useQuery } from '@tanstack/react-query'

const { get, getById } = generateAPIMethods('/vehicle-report')

export const useVehicleReportsQuery = () => {
  return useQuery({
    queryKey: ['vehicleReports'],
    queryFn: async () => {
      const response = await get({})
      return response.data
    },
  })
}

export const useVehicleReportByIdQuery = (id: string) => {
  return useQuery({
    queryKey: ['vehicleReport', id],
    queryFn: async () => {
      const response = await getById({ _id: id })
      return response.data
    },
    enabled: !!id,
  })
}

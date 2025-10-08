import { generateAPIMethods } from '@api'
import { useQuery } from '@tanstack/react-query'
import { nameToPath } from '@utils'

const { get, getById } = generateAPIMethods('/vehicle-report')

export const useVehicleReportsQuery = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ['vehicleReports', params],
    queryFn: async () => {
      let queryParams: Record<string, any> = {}

      if (params && Object.keys(params).length > 0) {
        const { vehicleCategory, vehicle, year, ...filters } = params
        if (vehicleCategory !== undefined) {
          queryParams.vehicleCategory = nameToPath(vehicleCategory)
        }
        if (vehicle !== undefined) {
          queryParams.vehicle = vehicle
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

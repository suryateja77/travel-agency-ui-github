import { generateAPIMethods } from '@api'
import { useQuery } from '@tanstack/react-query'

const { get, getById, exportExcel, exportCsv } = generateAPIMethods('/staff-account')

export const useStaffAccountsQuery = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ['staffAccounts', params],
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

export const useStaffAccountByIdQuery = (id: string) => {
  return useQuery({
    queryKey: ['staffAccount', id],
    queryFn: async () => {
      const response = await getById({ _id: id })
      return response.data
    },
    enabled: !!id,
  })
}

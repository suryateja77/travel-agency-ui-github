import { generateAPIMethods } from '@api'
import { useQuery } from '@tanstack/react-query'

const { get, getById } = generateAPIMethods('/staff-account')

export const useStaffAccountsQuery = () => {
  return useQuery({
    queryKey: ['staffAccounts'],
    queryFn: async () => {
      const response = await get({})
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

import { post } from '@api'
import { useMutation } from '@tanstack/react-query'

const API_BASE_URL = '/client'

export const useRegisterClientMutation = () => {
  return useMutation({
    mutationFn: async ({ ...clientData }: Record<string, any>) => {
      return await post(`${API_BASE_URL}/register`, clientData)
    },
  })
}

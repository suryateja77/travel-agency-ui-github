import { post } from '@api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const API_BASE_URL = '/user'

export const useRegisterUserMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ ...userData }: Record<string, any>) => {
      await post(`${API_BASE_URL}/register`, userData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export const useAuthenticateUserMutation = () => {
  return useMutation({
    mutationFn: async ({ ...userData }: Record<string, any>) => {
      return await post(`${API_BASE_URL}/authenticate`, userData)
    },
  })
}

export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: async ({ ...userData }: Record<string, any>) => {
      await post(`${API_BASE_URL}/forgot-password`, userData)
    },
  })
}

export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: async ({ requestBody, userId, token }: { requestBody: Record<string, any>, userId: string, token: string }) => {
      const apiUrl = `${API_BASE_URL}/reset-password/${userId}/${token}`
      await post(apiUrl, requestBody)
    },
  })
}

export const useVerifyEmailMutation = () => {
  return useMutation({
    mutationFn: async ({ requestBody, token }: { requestBody: Record<string, any>, token: string }) => {
      const apiUrl = `${API_BASE_URL}/verify-email/${token}`
      await post(apiUrl, requestBody)
    },
  })
}

export const useLogoutMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await post(`${API_BASE_URL}/logout`, {})
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
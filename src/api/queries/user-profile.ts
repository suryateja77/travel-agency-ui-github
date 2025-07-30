import { patch, post } from '@api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const API_BASE_URL = '/user-profile'

export const useUpdateUserProfileMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ ...userProfileData }: Record<string, any>) => {
      await patch(`${API_BASE_URL}/update`, userProfileData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] })
    },
  })
}

export const useChangePasswordMutation = () => {
  return useMutation({
    mutationFn: async ({ ...userProfileData }: Record<string, any>) => {
      await patch(`${API_BASE_URL}/change-password`, userProfileData)
    },
  })
}

export const useChangeProfileMutation = () => {
  return useMutation({
    mutationFn: async ({ ...userProfileData }: Record<string, any>) => {
      await post(`${API_BASE_URL}/change-profile`, userProfileData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    },
  })
}

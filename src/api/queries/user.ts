import { get, post, patch, remove } from '@api'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { UserModel } from '@types'

const API_BASE_URL = '/user'

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

// User Management CRUD Operations

// Query to get all users
export const useUsersQuery = () => {
  return useQuery({
    queryKey: ['users', 'list'],
    queryFn: async () => {
      const response = await get(`${API_BASE_URL}/list`)
      return response.data
    },
  })
}

// Query to get user by ID
export const useUserByIdQuery = (id: string) => {
  return useQuery({
    queryKey: ['users', id],
    queryFn: async () => {
      const response = await get(`${API_BASE_URL}/${id}`)
      return response.data
    },
    enabled: !!id,
  })
}

// Mutation to create user
export const useCreateUserMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userData: Omit<UserModel, '_id'>) => {
      const response = await post(`${API_BASE_URL}/create`, userData)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

// Mutation to update user
export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userData: UserModel) => {
      const { _id, ...updateData } = userData
      const response = await patch(`${API_BASE_URL}/${_id}`, updateData)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['users', variables._id] })
    },
  })
}

// Mutation to delete user
export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await remove(`${API_BASE_URL}/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
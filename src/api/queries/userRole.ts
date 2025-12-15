import { generateAPIMethods } from '@api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UserRoleModel } from '@types'

const { get, getById, create, updateById, delete: deleteUserRole } = generateAPIMethods('/user-role')

// Query keys
export const userRoleKeys = {
  all: ['userRoles'] as const,
  lists: () => [...userRoleKeys.all, 'list'] as const,
  list: (filters: string) => [...userRoleKeys.lists(), { filters }] as const,
  details: () => [...userRoleKeys.all, 'detail'] as const,
  detail: (id: string) => [...userRoleKeys.details(), id] as const,
}

// Get all user roles
export const useUserRolesQuery = (filterData?: Record<string, any>) => {
  return useQuery({
    queryKey: userRoleKeys.list(JSON.stringify(filterData || {})),
    queryFn: async () => {
      const response = await get({
        params: filterData ? { filterData: JSON.stringify(filterData) } : undefined,
      })
      return response.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Get user role by ID
export const useUserRoleByIdQuery = (id: string) => {
  return useQuery({
    queryKey: userRoleKeys.detail(id),
    queryFn: async () => {
      if (!id) return null
      const response = await getById({ _id: id })
      return response.data
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

// Create user role
export const useCreateUserRoleMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UserRoleModel) => {
      const response = await create(data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userRoleKeys.lists() })
    },
  })
}

// Update user role
export const useUpdateUserRoleMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ _id, ...data }: UserRoleModel & { _id: string }) => {
      const response = await updateById({ _id, ...data })
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userRoleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: userRoleKeys.detail(variables._id) })
    },
  })
}

// Delete user role
export const useDeleteUserRoleMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteUserRole({ _id: id })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userRoleKeys.lists() })
    },
  })
}

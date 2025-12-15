import { generateAPIMethods } from '@api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { UserGroupModel } from '@types'

const { get, getById, create, updateById, delete: deleteUserGroup } = generateAPIMethods('/user-group')

// Get all user groups
export const useUserGroupsQuery = () => {
  return useQuery({
    queryKey: ['user-groups'],
    queryFn: async () => {
      const response = await get({})
      return response.data
    }
  })
}

// Get single user group by ID
export const useUserGroupByIdQuery = (id: string) => {
  return useQuery({
    queryKey: ['user-groups', id],
    queryFn: async () => {
      if (!id) return null
      const response = await getById({ _id: id })
      return response.data
    },
    enabled: !!id
  })
}

// Create user group
export const useCreateUserGroupMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<UserGroupModel>) => {
      const response = await create(data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-groups'] })
    }
  })
}

// Update user group
export const useUpdateUserGroupMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<UserGroupModel> & { _id: string }) => {
      const response = await updateById(data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-groups'] })
    }
  })
}

// Delete user group
export const useDeleteUserGroupMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteUserGroup({ _id: id })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-groups'] })
    }
  })
}

import { generateAPIMethods } from '@api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const { get, getById, create, updateById, delete: deleteById } = generateAPIMethods('/expense')

export const useExpensesQuery = () => {
  return useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const response = await get({})
      return response.data
    },
  })
}

export const useExpenseByIdQuery = (id: string) => {
  return useQuery({
    queryKey: ['expense', id],
    queryFn: async () => {
      const response = await getById({ _id: id })
      return response.data
    },
    enabled: !!id,
  })
}

export const useCreateExpenseMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (expenseData: Record<string, any>) => {
      await create({ ...expenseData })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
    },
  })
}

export const useUpdateExpenseMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ _id, ...expenseData }: Record<string, any>) => {
      await updateById({ _id, ...expenseData })
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      if (variables && variables._id) {
        queryClient.invalidateQueries({ queryKey: ['expense', variables._id] })
      }
    },
  })
}

export const useDeleteExpenseMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: String) => {
      await deleteById({ _id: id })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
    },
  })
}

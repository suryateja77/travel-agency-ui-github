import { FunctionComponent } from 'react'
import { bemClass, pathToName } from '@utils'

import './style.scss'
import { Anchor, Currency } from '@base'
import EntityGrid from '@components/entity-grid'
import PageHeader from '@components/page-header'
import { useExpensesQuery, useExpensesByCategory, useDeleteExpenseMutation } from '@api/queries/expense'
import { useConfigurationsQuery } from '@api/queries/configuration'

const blk = 'expenses-list'

interface Props {
  category?: string
}

const formatDate = (dateString: string | Date) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const ExpensesList: FunctionComponent<Props> = ({ category = '' }) => {
  // Use category-specific query when category is provided, otherwise fetch all
  const { data: expensesResponse, isLoading } = category 
    ? useExpensesByCategory(category) 
    : useExpensesQuery()
  const { data: configurations } = useConfigurationsQuery()
  const deleteExpenseMutation = useDeleteExpenseMutation()

  // Extract data from the response structure
  const expensesData = expensesResponse?.data || []
  const totalExpenses = expensesResponse?.total || 0

  // No need to filter since we're using category-specific query
  const filteredExpensesData = expensesData

  // Get category name from configurations
  const getExpenseCategoryName = () => {
    if (!category) return 'Expenses'
    if (!configurations || !Array.isArray(configurations)) return pathToName(category)
    const expenseConfig = configurations.find((config: any) => config.name === 'Expense category')
    const categoryItem = expenseConfig?.configurationItems?.find((item: any) => item.name.toLowerCase() === category?.toLowerCase())
    return categoryItem?.name || pathToName(category)
  }

  const categoryName = getExpenseCategoryName()

  // Create dynamic columns based on category
  const getColumns = () => {
    const baseColumns = [
      {
        label: 'Expense Date',
        custom: ({ _id, date }: { _id: string; date: string }) => (
          <Anchor asLink href={`/expenses/${category}/${_id}/detail`}>
            {formatDate(date)}
          </Anchor>
        ),
      },
      {
        label: 'Expense Type',
        map: 'type',
      },
    ]

    // Add category-specific column
    const categorySpecificColumn = () => {
      if (category?.toLowerCase() === 'vehicle') {
        return {
          label: 'Vehicle',
          custom: ({ vehicle, vehicleCategory }: { vehicle: any; vehicleCategory: string }) => {
            if (!vehicle && !vehicleCategory) return '-'
            // Handle vehicle object with name and registrationNo
            if (vehicle && typeof vehicle === 'object') {
              return `${vehicle.name} (${vehicle.registrationNo})` || vehicleCategory || '-'
            }
            return vehicle || vehicleCategory || '-'
          },
        }
      } else if (category?.toLowerCase() === 'staff') {
        return {
          label: 'Staff',
          custom: ({ staff, staffCategory }: { staff: any; staffCategory: string }) => {
            if (!staff && !staffCategory) return '-'
            // Handle staff object with name
            if (staff && typeof staff === 'object') {
              return staff.name || staffCategory || '-'
            }
            return staff || staffCategory || '-'
          },
        }
      }
      return null
    }

    const endColumns = [
      {
        label: 'Location',
        map: 'location',
      },
      {
        label: 'Amount',
        className: 'text-right',
        custom: ({ amount }: { amount: number | string }) => (
          <Currency data={amount} />
        ),
      },
      {
        label: 'Payment Method',
        map: 'paymentMethod',
      },
    ]

    const specificColumn = categorySpecificColumn()
    return specificColumn 
      ? [...baseColumns, specificColumn, ...endColumns]
      : [...baseColumns, ...endColumns]
  }

  const columns = getColumns()

  const handleDeleteExpense = async (id: string) => {
    await deleteExpenseMutation.mutateAsync(id)
  }

  return (
    <div className={bemClass([blk])}>
      <PageHeader
        title={`${categoryName} Expenses`}
        total={filteredExpensesData.length}
        btnRoute={`/expenses/${category}/create`}
        btnLabel={`Add new ${categoryName} Expense`}
        exportButtonsToShow={{ csv: true, pdf: true, excel: true }}
      />
      <div className={bemClass([blk, 'content'])}>
        <EntityGrid
          columns={columns}
          data={filteredExpensesData}
          isLoading={isLoading}
          deleteHandler={handleDeleteExpense}
          editRoute={`/expenses/${category}`}
          routeParams={{ category }}
          queryParams={{ category }}
        />
      </div>
    </div>
  )
}

export default ExpensesList

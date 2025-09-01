import { FunctionComponent, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { bemClass, formatDateValueForDisplay } from '@utils'

import './style.scss'
import { Text, Alert } from '@base'
import Loader from '@components/loader'
import { expenseDetailsFields } from './model'
import { ExpenseModel, INITIAL_EXPENSE, Panel } from '@types'
import PageDetail from '@base/page-detail'
import { useExpenseByIdQuery } from '@api/queries/expense'

const blk = 'expense-detail'

interface ExpenseDetailProps {}

interface TransformedExpenseData extends Record<string, any> {
  type: string
  paymentMethod: string
  date: string
  amount: string
  location: string
  vehicleCategory: string | null
  vehicle: { name: string } | string | null
  staffCategory: string | null
  staff: { name: string } | string | null
  comment: string
  category: string
}

// Transform the expense data to handle object references and formatting
const transformExpenseData = (data: ExpenseModel, category: string): TransformedExpenseData => {
  return {
    ...data,
    date: formatDateValueForDisplay(data.date),
    amount: data.amount?.toString() || '-',
    comment: data.comment || '-',
    // Transform vehicle object reference for nested path access
    vehicle: (() => {
      if (category !== 'vehicle' || !data.vehicle) return null
      const vehicle = data.vehicle
      if (typeof vehicle === 'object' && 'name' in vehicle) {
        return vehicle
      }
      // If it's a string, create an object structure for consistency
      return { name: vehicle.toString() }
    })(),
    // Transform staff object reference for nested path access
    staff: (() => {
      if (category !== 'staff' || !data.staff) return null
      const staff = data.staff
      if (typeof staff === 'object' && 'name' in staff) {
        return staff
      }
      // If it's a string, create an object structure for consistency
      return { name: staff.toString() }
    })(),
  }
}

// Create filtered template based on expense category (vehicle or staff)
const createFilteredTemplate = (originalTemplate: Panel[], data: ExpenseModel, category: string): Panel[] => {
  return originalTemplate.filter(panel => {
    // Completely remove vehicle panel if category is not 'vehicle'
    if (panel.panel === 'Vehicle Details') {
      return category === 'vehicle'
    }
    // Completely remove staff panel if category is not 'staff'
    if (panel.panel === 'Staff Details') {
      return category === 'staff'
    }
    return true
  })
}

const ExpenseDetail: FunctionComponent<ExpenseDetailProps> = () => {
  const params = useParams()

  const { data: currentExpenseData, isLoading, error } = useExpenseByIdQuery(params.id || '')
  const [expenseData, setExpenseData] = useState<TransformedExpenseData | null>(null)

  // Get category from URL params (same pattern as create component)
  const category = params.category || ''

  // Memoize the filtered template based on expense category
  const filteredTemplate = useMemo(() => {
    if (!currentExpenseData) {
      return expenseDetailsFields
    }
    return createFilteredTemplate(expenseDetailsFields, currentExpenseData, category)
  }, [currentExpenseData, category])

  useEffect(() => {
    if (currentExpenseData) {
      const transformedData = transformExpenseData(currentExpenseData, category)
      setExpenseData(transformedData)
    }
  }, [currentExpenseData, category])

  return (
    <div className={bemClass([blk])}>
      <div className={bemClass([blk, 'header'])}>
        <Text color="gray-darker" typography="l">
          Expense Details
        </Text>
      </div>
      <div className={bemClass([blk, 'content'])}>
        {isLoading ? (
          <Loader type="form" />
        ) : error ? (
          <Alert
            type="error"
            message="Unable to get the expense details, please try later"
          />
        ) : (
          <PageDetail
            pageData={expenseData || INITIAL_EXPENSE}
            pageDataTemplate={filteredTemplate}
          />
        )}
      </div>
    </div>
  )
}

export default ExpenseDetail

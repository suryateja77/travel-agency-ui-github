import React, { FunctionComponent } from 'react'
import { Routes, Route, useParams } from 'react-router-dom'
import ExpensesList from './components/list'
import CreateExpense from './components/create'
import ExpenseDetail from './components/detail'
import { PermissionGuard } from '@components'

interface ExpensesProps {}

const CategoryExpenses: FunctionComponent<ExpensesProps> = () => {
  const params = useParams()
  return (
    <Routes>
      <Route
        path=""
        element={
          <PermissionGuard module="Expenses" requiredPermission="view">
            <ExpensesList category={params.category} />
          </PermissionGuard>
        }
      />
      <Route
        path="create"
        element={
          <PermissionGuard module="Expenses" requiredPermission="edit">
            <CreateExpense category={params.category} />
          </PermissionGuard>
        }
      />
      <Route
        path=":id/edit"
        element={
          <PermissionGuard module="Expenses" requiredPermission="edit">
            <CreateExpense category={params.category} />
          </PermissionGuard>
        }
      />
      <Route
        path=":id/detail"
        element={
          <PermissionGuard module="Expenses" requiredPermission="view">
            <ExpenseDetail />
          </PermissionGuard>
        }
      />
    </Routes>
  )
}

export default CategoryExpenses

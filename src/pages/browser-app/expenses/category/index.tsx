import React, { FunctionComponent } from 'react'
import { Routes, Route, useParams } from 'react-router-dom'
import ExpensesList from './components/list'
import CreateExpense from './components/create'

interface ExpensesProps {}

const CategoryExpenses: FunctionComponent<ExpensesProps> = () => {
  const params = useParams()
  return (
    <Routes>
      <Route
        path=""
        element={<ExpensesList category={params.category} />}
      />
      <Route
        path="create"
        element={<CreateExpense category={params.category} />}
      />
    </Routes>
  )
}

export default CategoryExpenses

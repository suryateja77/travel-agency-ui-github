import React, { FunctionComponent } from 'react'
import { Routes, Route } from 'react-router-dom'
import MonthlyFixedRequestsList from './components/list'
import CreateMonthlyFixedRequest from './components/create'

interface MonthlyFixedRequestsProps {}

const MonthlyFixedRequests: FunctionComponent<MonthlyFixedRequestsProps> = () => {
  return (
    <Routes>
      <Route
        path=""
        element={<MonthlyFixedRequestsList />}
      />
      <Route
        path="create"
        element={<CreateMonthlyFixedRequest />}
      />
    </Routes>
  )
}

export default MonthlyFixedRequests

import React, { FunctionComponent } from 'react'
import { Routes, Route } from 'react-router-dom'
import MonthlyFixedRequestsList from './components/list'
import CreateMonthlyFixedRequest from './components/create'
import MonthlyFixedRequestDetail from './components/detail'

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
      <Route
        path=":id/edit"
        element={<CreateMonthlyFixedRequest />}
      />
      <Route
        path=":id/detail"
        element={<MonthlyFixedRequestDetail />}
      />
    </Routes>
  )
}

export default MonthlyFixedRequests

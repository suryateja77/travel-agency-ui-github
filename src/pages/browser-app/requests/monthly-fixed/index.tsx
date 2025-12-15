import React, { FunctionComponent } from 'react'
import { Routes, Route } from 'react-router-dom'
import { PermissionGuard } from '@components'
import MonthlyFixedRequestsList from './components/list'
import CreateMonthlyFixedRequest from './components/create/index'
import MonthlyFixedRequestDetail from './components/detail'

interface MonthlyFixedRequestsProps {}

const MonthlyFixedRequests: FunctionComponent<MonthlyFixedRequestsProps> = () => {
  return (
    <Routes>
      <Route
        path=""
        element={
          <PermissionGuard module="Monthly Fixed Requests" requiredPermission="view">
            <MonthlyFixedRequestsList />
          </PermissionGuard>
        }
      />
      <Route
        path="create"
        element={
          <PermissionGuard module="Monthly Fixed Requests" requiredPermission="edit">
            <CreateMonthlyFixedRequest />
          </PermissionGuard>
        }
      />
      <Route
        path=":id/edit"
        element={
          <PermissionGuard module="Monthly Fixed Requests" requiredPermission="edit">
            <CreateMonthlyFixedRequest />
          </PermissionGuard>
        }
      />
      <Route
        path=":id/detail"
        element={
          <PermissionGuard module="Monthly Fixed Requests" requiredPermission="view">
            <MonthlyFixedRequestDetail />
          </PermissionGuard>
        }
      />
    </Routes>
  )
}

export default MonthlyFixedRequests

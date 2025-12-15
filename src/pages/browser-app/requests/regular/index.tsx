import React, { FunctionComponent } from 'react'
import { Routes, Route } from 'react-router-dom'
import { PermissionGuard } from '@components'
import RegularRequestsList from './components/list'
import CreateRegularRequest from './components/create'
import RegularRequestDetail from './components/detail'

interface RegularRequestsProps {}

const RegularRequests: FunctionComponent<RegularRequestsProps> = () => {
  return (
    <Routes>
      <Route
        path=""
        element={
          <PermissionGuard module="Regular Requests" requiredPermission="view">
            <RegularRequestsList />
          </PermissionGuard>
        }
      />
      <Route
        path="create"
        element={
          <PermissionGuard module="Regular Requests" requiredPermission="edit">
            <CreateRegularRequest />
          </PermissionGuard>
        }
      />
      <Route
        path=":id/edit"
        element={
          <PermissionGuard module="Regular Requests" requiredPermission="edit">
            <CreateRegularRequest />
          </PermissionGuard>
        }
      />
      <Route
        path=":id/detail"
        element={
          <PermissionGuard module="Regular Requests" requiredPermission="view">
            <RegularRequestDetail />
          </PermissionGuard>
        }
      />
    </Routes>
  )
}

export default RegularRequests

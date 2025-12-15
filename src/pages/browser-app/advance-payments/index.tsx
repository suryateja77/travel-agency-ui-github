import React, { FunctionComponent } from 'react'
import { Routes, Route } from 'react-router-dom'
import AdvancePaymentList from './components/list'
import CreateAdvancePayment from './components/create'
import AdvancePaymentDetail from './components/detail'
import { PermissionGuard } from '@components'

interface AdvancePaymentsProps {}

const AdvancePayments: FunctionComponent<AdvancePaymentsProps> = () => {
  return (
    <Routes>
      <Route
        path=""
        element={
          <PermissionGuard module="Advance Payments" requiredPermission="view">
            <AdvancePaymentList />
          </PermissionGuard>
        }
      />
      <Route
        path="create"
        element={
          <PermissionGuard module="Advance Payments" requiredPermission="edit">
            <CreateAdvancePayment />
          </PermissionGuard>
        }
      />
      <Route
        path=":id/edit"
        element={
          <PermissionGuard module="Advance Payments" requiredPermission="edit">
            <CreateAdvancePayment />
          </PermissionGuard>
        }
      />
      <Route
        path=":id/detail"
        element={
          <PermissionGuard module="Advance Payments" requiredPermission="view">
            <AdvancePaymentDetail />
          </PermissionGuard>
        }
      />
    </Routes>
  )
}

export default AdvancePayments

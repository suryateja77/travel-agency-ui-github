import React from 'react'
import { Route, Routes } from 'react-router-dom'
import StaffPayments from './staff'
import VehiclePayments from './vehicle'
import SupplierPayments from './supplier'
import { PermissionGuard } from '@components'

const Payments = () => {
  return (
    <Routes>
      <Route
        path="vehicle"
        element={
          <PermissionGuard module="Vehicle Payments" requiredPermission="view">
            <VehiclePayments />
          </PermissionGuard>
        }
      />
      <Route
        path="staff"
        element={
          <PermissionGuard module="Staff Payments" requiredPermission="view">
            <StaffPayments />
          </PermissionGuard>
        }
      />
      <Route
        path="supplier"
        element={
          <PermissionGuard module="Supplier Payments" requiredPermission="view">
            <SupplierPayments />
          </PermissionGuard>
        }
      />
    </Routes>
  )
}

export default Payments

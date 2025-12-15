import React, { FunctionComponent } from 'react'
import { Routes, Route } from 'react-router-dom'
import { PermissionGuard } from '@components'
import { SupplierList, CreateSupplier, SupplierDetail } from './components'

interface SupplierProps {}

const Suppliers: FunctionComponent<SupplierProps> = () => {
  return (
    <Routes>
      <Route
        path=""
        element={
          <PermissionGuard module="Suppliers" requiredPermission="view">
            <SupplierList />
          </PermissionGuard>
        }
      />
      <Route
        path="create"
        element={
          <PermissionGuard module="Suppliers" requiredPermission="edit">
            <CreateSupplier />
          </PermissionGuard>
        }
      />
      <Route
        path=":id/edit"
        element={
          <PermissionGuard module="Suppliers" requiredPermission="edit">
            <CreateSupplier />
          </PermissionGuard>
        }
      />
      <Route
        path=":id/detail"
        element={
          <PermissionGuard module="Suppliers" requiredPermission="view">
            <SupplierDetail />
          </PermissionGuard>
        }
      />
    </Routes>
  )
}

export default Suppliers

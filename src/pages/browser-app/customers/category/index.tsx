import { FunctionComponent } from 'react'
import { Routes, Route, useParams } from 'react-router-dom'
import { CustomersList, CreateCustomer } from './components'
import CustomerDetail from './components/detail'
import { PermissionGuard } from '@components'

const CategoryCustomers: FunctionComponent = () => {
  const params = useParams()
  return (
    <Routes>
      <Route
        path=""
        element={
          <PermissionGuard module="Customers" requiredPermission="view">
            <CustomersList category={params.category} />
          </PermissionGuard>
        }
      />
      <Route
        path="create"
        element={
          <PermissionGuard module="Customers" requiredPermission="edit">
            <CreateCustomer category={params.category} />
          </PermissionGuard>
        }
      />
      <Route
        path=":id/edit"
        element={
          <PermissionGuard module="Customers" requiredPermission="edit">
            <CreateCustomer category={params.category} />
          </PermissionGuard>
        }
      />
      <Route
        path=":id/detail"
        element={
          <PermissionGuard module="Customers" requiredPermission="view">
            <CustomerDetail />
          </PermissionGuard>
        }
      />
    </Routes>
  )
}

export default CategoryCustomers
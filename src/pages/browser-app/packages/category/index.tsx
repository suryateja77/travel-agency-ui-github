import React, { FunctionComponent } from 'react'
import { Routes, Route, useParams } from 'react-router-dom'
import PackagesList from './components/list'
import CreatePackage from './components/create'
import PackageDetail from './components/detail'
import { PermissionGuard } from '@components'

interface PackagesProps {}

const CategoryPackages: FunctionComponent<PackagesProps> = () => {
  const params = useParams()
  console.log('Route parameters:', params)
  const { category } = params
  return (
    <Routes>
      <Route
        path=""
        element={
          <PermissionGuard module="Packages" requiredPermission="view">
            <PackagesList category={category} />
          </PermissionGuard>
        }
      />
      <Route
        path="create"
        element={
          <PermissionGuard module="Packages" requiredPermission="edit">
            <CreatePackage category={category} />
          </PermissionGuard>
        }
      />
      <Route
        path=":id/edit"
        element={
          <PermissionGuard module="Packages" requiredPermission="edit">
            <CreatePackage category={category} />
          </PermissionGuard>
        }
      />
      <Route
        path=":id/detail"
        element={
          <PermissionGuard module="Packages" requiredPermission="view">
            <PackageDetail category={category} />
          </PermissionGuard>
        }
      />
    </Routes>
  )
}

export default CategoryPackages

import React, { FunctionComponent } from 'react'
import { Routes, Route, useParams } from 'react-router-dom'
import { PermissionGuard } from '@components'
import VehiclesList from './components/list'
import CreateVehicle from './components/create'
import VehicleDetail from './components/detail'

interface VehiclesProps {}

const CategoryVehicles: FunctionComponent<VehiclesProps> = () => {
  const params = useParams()
  return (
    <Routes>
      <Route
        path=""
        element={
          <PermissionGuard module="Vehicles" requiredPermission="view">
            <VehiclesList category={params.category} />
          </PermissionGuard>
        }
      />
      <Route
        path="create"
        element={
          <PermissionGuard module="Vehicles" requiredPermission="edit">
            <CreateVehicle category={params.category} />
          </PermissionGuard>
        }
      />
      <Route
        path=":id/edit"
        element={
          <PermissionGuard module="Vehicles" requiredPermission="edit">
            <CreateVehicle category={params.category} />
          </PermissionGuard>
        }
      />
      <Route
        path=":id/detail"
        element={
          <PermissionGuard module="Vehicles" requiredPermission="view">
            <VehicleDetail category={params.category} />
          </PermissionGuard>
        }
      />
    </Routes>
  )
}

export default CategoryVehicles

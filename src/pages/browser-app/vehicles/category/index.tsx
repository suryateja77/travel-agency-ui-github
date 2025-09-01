import React, { FunctionComponent } from 'react'
import { Routes, Route, useParams } from 'react-router-dom'
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
        element={<VehiclesList category={params.category} />}
      />
      <Route
        path="create"
        element={<CreateVehicle category={params.category} />}
      />
      <Route
        path=":id/edit"
        element={<CreateVehicle category={params.category} />}
      />
      <Route
        path=":id/detail"
        element={<VehicleDetail />}
      />
    </Routes>
  )
}

export default CategoryVehicles

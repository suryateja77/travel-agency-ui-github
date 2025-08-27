import React, { FunctionComponent } from 'react'
import { Routes, Route, useParams } from 'react-router-dom'
import VehiclesList from './components/list'
import CreateVehicle from './components/create'

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
    </Routes>
  )
}

export default CategoryVehicles

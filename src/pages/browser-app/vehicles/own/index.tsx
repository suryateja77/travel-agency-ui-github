import React, { FunctionComponent } from 'react'
import { Routes, Route } from 'react-router-dom'
import VehiclesList from './components/list'
import CreateVehicle from './components/create'

interface VehiclesProps {}

const OwnVehicles: FunctionComponent<VehiclesProps> = () => {
  return (
    <Routes>
      <Route
        path=""
        element={<VehiclesList />}
      />
      <Route
        path="create"
        element={<CreateVehicle />}
      />
    </Routes>
  )
}

export default OwnVehicles

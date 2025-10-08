import React from 'react'
import { Route, Routes } from 'react-router-dom'
import BusinessReport from './business'
import VehicleReport from './vehicle'

const Reports = () => {
  return (
    <Routes>
      <Route
        path="business"
        element={<BusinessReport />}
      />
      <Route
        path="vehicle"
        element={<VehicleReport />}
      />
    </Routes>
  )
}

export default Reports

import React from 'react'
import { Route, Routes } from 'react-router-dom'
import StaffPayments from './staff'
import VehiclePayments from './vehicle'

const Payments = () => {
  return (
    <Routes>
      <Route
        path="vehicle"
        element={<VehiclePayments />}
      />
      <Route
        path="staff"
        element={<StaffPayments />}
      />
    </Routes>
  )
}

export default Payments

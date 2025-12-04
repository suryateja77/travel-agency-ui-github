import React from 'react'
import { Route, Routes } from 'react-router-dom'
import StaffPayments from './staff'
import VehiclePayments from './vehicle'
import SupplierPayments from './supplier'

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
      <Route
        path="supplier"
        element={<SupplierPayments />}
      />
    </Routes>
  )
}

export default Payments

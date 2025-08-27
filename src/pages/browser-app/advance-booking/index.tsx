import React, { FunctionComponent } from 'react'
import { Routes, Route } from 'react-router-dom'
import AdvanceBookingList from './components/list'
import CreateAdvanceBooking from './components/create'

interface AdvanceBookingsProps {}

const AdvanceBookings: FunctionComponent<AdvanceBookingsProps> = () => {
  return (
    <Routes>
      <Route
        path=""
        element={<AdvanceBookingList />}
      />
      <Route
        path="create"
        element={<CreateAdvanceBooking />}
      />
      <Route
        path=":id/edit"
        element={<CreateAdvanceBooking />}
      />
    </Routes>
  )
}

export default AdvanceBookings

import React, { FunctionComponent } from 'react'
import { Routes, Route } from 'react-router-dom'
import AdvanceBookingList from './components/list'
import CreateAdvanceBooking from './components/create'
import AdvanceBookingDetail from './components/detail'
import { PermissionGuard } from '@components'

interface AdvanceBookingsProps {}

const AdvanceBookings: FunctionComponent<AdvanceBookingsProps> = () => {
  return (
    <Routes>
      <Route
        path=""
        element={
          <PermissionGuard module="Advance Bookings" requiredPermission="view">
            <AdvanceBookingList />
          </PermissionGuard>
        }
      />
      <Route
        path="create"
        element={
          <PermissionGuard module="Advance Bookings" requiredPermission="edit">
            <CreateAdvanceBooking />
          </PermissionGuard>
        }
      />
      <Route
        path=":id/edit"
        element={
          <PermissionGuard module="Advance Bookings" requiredPermission="edit">
            <CreateAdvanceBooking />
          </PermissionGuard>
        }
      />
      <Route
        path=":id/detail"
        element={
          <PermissionGuard module="Advance Bookings" requiredPermission="view">
            <AdvanceBookingDetail />
          </PermissionGuard>
        }
      />
    </Routes>
  )
}

export default AdvanceBookings

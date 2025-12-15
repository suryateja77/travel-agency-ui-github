import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { PermissionGuard } from '@components'
import BusinessReport from './business'
import VehicleReport from './vehicle'

const Reports = () => {
  return (
    <Routes>
      <Route
        path="business"
        element={
          <PermissionGuard module="Business Reports" requiredPermission="view">
            <BusinessReport />
          </PermissionGuard>
        }
      />
      <Route
        path="vehicle"
        element={
          <PermissionGuard module="Vehicle Reports" requiredPermission="view">
            <VehicleReport />
          </PermissionGuard>
        }
      />
    </Routes>
  )
}

export default Reports

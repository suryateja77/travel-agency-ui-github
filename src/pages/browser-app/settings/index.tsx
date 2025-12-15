import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { PermissionGuard } from '@components'
import Configurations from './configuration'
import Profile from './profile'

const Settings = () => {
  return (
    <Routes>
      <Route 
        path="/configurations/*" 
        element={
          <PermissionGuard module="Configurations" requiredPermission="view">
            <Configurations />
          </PermissionGuard>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <PermissionGuard module="Profile" requiredPermission="view">
            <Profile />
          </PermissionGuard>
        } 
      />
    </Routes>
  )
}

export default Settings

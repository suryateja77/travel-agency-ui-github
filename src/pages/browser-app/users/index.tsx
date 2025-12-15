import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { PermissionGuard } from '@components'
import UserList from './user-list'
import UserRoles from './user-roles'
import UserGroups from './user-groups'

const Users = () => {
  return (
    <Routes>
      <Route 
        path="/user-list/*" 
        element={
          <PermissionGuard module="User List" requiredPermission="view">
            <UserList />
          </PermissionGuard>
        } 
      />
      <Route 
        path="/user-roles/*" 
        element={
          <PermissionGuard module="User Roles" requiredPermission="view">
            <UserRoles />
          </PermissionGuard>
        } 
      />
      <Route 
        path="/user-groups/*" 
        element={
          <PermissionGuard module="User Groups" requiredPermission="view">
            <UserGroups />
          </PermissionGuard>
        } 
      />
    </Routes>
  )
}

export default Users

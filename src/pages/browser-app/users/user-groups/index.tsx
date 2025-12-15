import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { PermissionGuard } from '@components'
import { UserGroupsList, CreateUserGroup, UserGroupDetail } from './components'

const UserGroups = () => {
  return (
    <Routes>
      <Route
        path=""
        element={
          <PermissionGuard module="User Groups" requiredPermission="view">
            <UserGroupsList />
          </PermissionGuard>
        }
      />
      <Route
        path="create"
        element={
          <PermissionGuard module="User Groups" requiredPermission="edit">
            <CreateUserGroup />
          </PermissionGuard>
        }
      />
      <Route
        path=":id/edit"
        element={
          <PermissionGuard module="User Groups" requiredPermission="edit">
            <CreateUserGroup />
          </PermissionGuard>
        }
      />
      <Route
        path="/:id"
        element={
          <PermissionGuard module="User Groups" requiredPermission="view">
            <UserGroupDetail />
          </PermissionGuard>
        }
      />
    </Routes>
  )
}

export default UserGroups

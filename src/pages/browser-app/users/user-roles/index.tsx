import React from 'react'
import { Routes, Route } from 'react-router-dom'
import UserRoleList from './components/list'
import UserRoleCreate from './components/create'
import UserRoleDetail from './components/detail'

const UserRoles = () => {
  return (
    <Routes>
      <Route path="/" element={<UserRoleList />} />
      <Route path="/create" element={<UserRoleCreate />} />
      <Route path="/:id/edit" element={<UserRoleCreate />} />
      <Route path="/:id" element={<UserRoleDetail />} />
    </Routes>
  )
}

export default UserRoles

import React from 'react'
import { Routes, Route } from 'react-router-dom'
import UserList from './components/list'
import UserCreate from './components/create'
import UserDetail from './components/detail'

const UserListRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<UserList />} />
      <Route path="/create" element={<UserCreate />} />
      <Route path="/:id/edit" element={<UserCreate />} />
      <Route path="/:id" element={<UserDetail />} />
    </Routes>
  )
}

export default UserListRoutes

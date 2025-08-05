import React, { FunctionComponent } from 'react'
import { Routes, Route } from 'react-router-dom'
import RegularRequestsList from './components/list'
import CreateRegularRequest from './components/create'

interface RegularRequestsProps {}

const RegularRequests: FunctionComponent<RegularRequestsProps> = () => {
  return (
    <Routes>
      <Route
        path=""
        element={<RegularRequestsList />}
      />
      <Route
        path="create"
        element={<CreateRegularRequest />}
      />
    </Routes>
  )
}

export default RegularRequests

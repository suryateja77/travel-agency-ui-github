import React, { FunctionComponent } from 'react'
import { Routes, Route } from 'react-router-dom'
import RegularRequestsList from './components/list'
import CreateRegularRequest from './components/create'
import RegularRequestDetail from './components/detail'

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
      <Route
        path=":id/edit"
        element={<CreateRegularRequest />}
      />
      <Route
        path=":id/detail"
        element={<RegularRequestDetail />}
      />
    </Routes>
  )
}

export default RegularRequests

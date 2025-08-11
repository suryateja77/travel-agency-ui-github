import React, { FunctionComponent } from 'react'
import { Routes, Route } from 'react-router-dom'
import PackagesList from './components/list'
import CreatePackage from './components/create'

interface PackagesProps {}

const LocalPackages: FunctionComponent<PackagesProps> = () => {
  return (
    <Routes>
      <Route
        path=""
        element={<PackagesList />}
      />
      <Route
        path="create"
        element={<CreatePackage />}
      />
    </Routes>
  )
}

export default LocalPackages

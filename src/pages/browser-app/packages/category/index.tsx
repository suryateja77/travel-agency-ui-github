import React, { FunctionComponent } from 'react'
import { Routes, Route, useParams } from 'react-router-dom'
import PackagesList from './components/list'
import CreatePackage from './components/create'
import PackageDetail from './components/detail'

interface PackagesProps {}

const CategoryPackages: FunctionComponent<PackagesProps> = () => {
  const params = useParams()
  console.log('Route parameters:', params)
  const { category } = params
  return (
    <Routes>
      <Route
        path=""
        element={<PackagesList category={category} />}
      />
      <Route
        path="create"
        element={<CreatePackage category={category} />}
      />
      <Route
        path=":id/edit"
        element={<CreatePackage category={category} />}
      />
      <Route
        path=":id/detail"
        element={<PackageDetail category={category} />}
      />
    </Routes>
  )
}

export default CategoryPackages

import React, { FunctionComponent } from 'react'
import { Routes, Route } from 'react-router-dom'
import { SupplierList, CreateSupplier, SupplierDetail } from './components'

interface SupplierProps {}

const Suppliers: FunctionComponent<SupplierProps> = () => {
  return (
    <Routes>
      <Route
        path=""
        element={<SupplierList />}
      />
      <Route
        path="create"
        element={<CreateSupplier />}
      />
      <Route
        path=":id/edit"
        element={<CreateSupplier />}
      />
      <Route
        path=":id/detail"
        element={<SupplierDetail />}
      />
    </Routes>
  )
}

export default Suppliers

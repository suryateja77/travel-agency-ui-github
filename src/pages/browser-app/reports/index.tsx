import React from 'react'
import { Route, Routes } from 'react-router-dom'
import BusinessReport from './business'

const Reports = () => {
  return (
    <Routes>
      <Route
        path="business"
        element={<BusinessReport />}
      />
    </Routes>
  )
}

export default Reports

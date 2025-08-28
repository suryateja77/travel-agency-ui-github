import React, { FunctionComponent } from 'react'
import { Routes, Route } from 'react-router-dom'
import AdvancePaymentList from './components/list'
import CreateAdvancePayment from './components/create'

interface AdvancePaymentsProps {}

const AdvancePayments: FunctionComponent<AdvancePaymentsProps> = () => {
  return (
    <Routes>
      <Route
        path=""
        element={<AdvancePaymentList />}
      />
      <Route
        path="create"
        element={<CreateAdvancePayment />}
      />
      <Route
        path=":id/edit"
        element={<CreateAdvancePayment />}
      />
    </Routes>
  )
}

export default AdvancePayments

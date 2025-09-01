import React, { FunctionComponent } from 'react'
import { Routes, Route } from 'react-router-dom'
import AdvancePaymentList from './components/list'
import CreateAdvancePayment from './components/create'
import AdvancePaymentDetail from './components/detail'

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
      <Route
        path=":id/detail"
        element={<AdvancePaymentDetail />}
      />
    </Routes>
  )
}

export default AdvancePayments

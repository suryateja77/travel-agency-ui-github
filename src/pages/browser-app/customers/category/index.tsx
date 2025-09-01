import { FunctionComponent } from 'react'
import { Routes, Route, useParams } from 'react-router-dom'
import { CustomersList, CreateCustomer } from './components'
import CustomerDetail from './components/detail'

const CategoryCustomers: FunctionComponent = () => {
  const params = useParams()
  return (
    <Routes>
      <Route
        path=""
        element={<CustomersList category={params.category} />}
      />
      <Route
        path="create"
        element={<CreateCustomer category={params.category} />}
      />
      <Route
        path=":id/edit"
        element={<CreateCustomer category={params.category} />}
      />
      <Route
        path=":id/detail"
        element={<CustomerDetail />}
      />
    </Routes>
  )
}

export default CategoryCustomers
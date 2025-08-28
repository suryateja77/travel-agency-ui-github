import { FunctionComponent } from 'react'
import { Routes, Route, useParams } from 'react-router-dom'
import StaffList from './components/list'
import CreateStaff from './components/create'
import StaffDetail from './components/detail'

interface StaffProps {}

const CategoryStaff: FunctionComponent<StaffProps> = () => {
  const params = useParams()
  return (
    <Routes>
      <Route
        path=""
        element={<StaffList category={params.category} />}
      />
      <Route
        path="create"
        element={<CreateStaff category={params.category} />}
      />
      <Route
        path=":id/edit"
        element={<CreateStaff category={params.category} />}
      />
      <Route
        path=":id/detail"
        element={<StaffDetail />}
      />
    </Routes>
  )
}

export default CategoryStaff
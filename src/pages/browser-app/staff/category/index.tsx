import { FunctionComponent } from 'react'
import { Routes, Route, useParams } from 'react-router-dom'
import StaffList from './components/list'
import CreateStaff from './components/create'

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
    </Routes>
  )
}

export default CategoryStaff
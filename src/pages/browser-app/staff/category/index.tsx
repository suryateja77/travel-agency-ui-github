import { FunctionComponent } from 'react'
import { Routes, Route, useParams } from 'react-router-dom'
import { PermissionGuard } from '@components'
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
        element={
          <PermissionGuard module="Staff" requiredPermission="view">
            <StaffList category={params.category} />
          </PermissionGuard>
        }
      />
      <Route
        path="create"
        element={
          <PermissionGuard module="Staff" requiredPermission="edit">
            <CreateStaff category={params.category} />
          </PermissionGuard>
        }
      />
      <Route
        path=":id/edit"
        element={
          <PermissionGuard module="Staff" requiredPermission="edit">
            <CreateStaff category={params.category} />
          </PermissionGuard>
        }
      />
      <Route
        path=":id/detail"
        element={
          <PermissionGuard module="Staff" requiredPermission="view">
            <StaffDetail />
          </PermissionGuard>
        }
      />
    </Routes>
  )
}

export default CategoryStaff
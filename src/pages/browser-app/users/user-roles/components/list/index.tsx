import React, { FunctionComponent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Text, Breadcrumb, Anchor } from '@base'
import { EntityGrid, PageHeader } from '@components'
import { bemClass, downloadFile, canEdit, canDelete } from '@utils'
import { useAuth } from '@contexts/AuthContext'
import { useToast } from '@contexts/ToastContext'
import { useUserRolesQuery, useDeleteUserRoleMutation } from '@api/queries/userRole'
import { UserRoleModel } from '@types'

import './style.scss'

const blk = 'user-roles-list'

interface UserRoleListProps {}

const UserRoleList: FunctionComponent<UserRoleListProps> = () => {
  // Get permissions for User Roles module
  const { permissions } = useAuth()
  const hasEditPermission = canEdit(permissions, 'User Roles')
  const hasDeletePermission = canDelete(permissions, 'User Roles')
  
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: userRolesData, isLoading, error } = useUserRolesQuery()
  const deleteMutation = useDeleteUserRoleMutation()

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id)
      showToast('User role deleted successfully', 'success')
      setDeleteId(null)
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to delete user role'
      showToast(errorMessage, 'error')
    }
  }

  const handleExportExcel = () => {
    downloadFile('/user-role/export/excel', 'user-roles.xlsx')
  }

  const handleExportCSV = () => {
    downloadFile('/user-role/export/csv', 'user-roles.csv')
  }

  const handleExportPDF = () => {
    downloadFile('/user-role/export/pdf', 'user-roles.pdf')
  }

  const columns = [
    {
      label: 'Role Name',
      custom: (row: UserRoleModel) => (
        <Anchor href={`/users/user-roles/${row._id}`} asLink>
          {row.roleName}
        </Anchor>
      ),
    },
    {
      label: 'System Role',
      custom: (row: UserRoleModel) => (row.isSystemRole ? 'Yes' : 'No'),
    },
    {
      label: 'Status',
      custom: (row: UserRoleModel) => (row.isActive ? 'Active' : 'Inactive'),
    },
  ]

  const canModifyUser = (row: UserRoleModel) => {
      return !row.isSystemRole
    }

  return (
    <div className={bemClass([blk])}>

      <PageHeader
        title="User Roles"
        total={userRolesData?.total || 0}
        btnRoute={hasEditPermission ? "/users/user-roles/create" : undefined}
        btnLabel={hasEditPermission ? "Add User Role" : undefined}
        showExport={true}
        onExportExcel={handleExportExcel}
        onExportCsv={handleExportCSV}
        onExportPdf={handleExportPDF}
      />

      <EntityGrid
        columns={columns}
        data={userRolesData?.data || []}
        isLoading={isLoading}
        deleteHandler={hasDeletePermission ? handleDelete : undefined}
        editRoute={hasEditPermission ? "/users/user-roles" : undefined}
        canEdit={canModifyUser}
        canDelete={canModifyUser}
      />
    </div>
  )
}

export default UserRoleList

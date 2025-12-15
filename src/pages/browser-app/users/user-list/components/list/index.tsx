import React, { FunctionComponent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUsersQuery, useDeleteUserMutation } from '@api/queries/user'
import { PageHeader, EntityGrid } from '@components'
import { Anchor } from '@base'
import { bemClass, canEdit, canDelete } from '@utils'
import { useAuth } from '@contexts/AuthContext'
import { useToast } from '@contexts/ToastContext'
import { UserModel, UserRoleModel } from '@types'

import './style.scss'

const blk = 'user-list'

const UserList: FunctionComponent = () => {
  // Get permissions for User List module
  const { permissions } = useAuth()
  const hasEditPermission = canEdit(permissions, 'User List')
  const hasDeletePermission = canDelete(permissions, 'User List')
  
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { data: usersData, isLoading, error } = useUsersQuery()
  const deleteMutation = useDeleteUserMutation()

  const columns = [
    {
      label: 'Name',
      custom: (row: UserModel) => (
        <Anchor href={`/users/user-list/${row._id}`} asLink>
          {row.name}
        </Anchor>
      ),
    },
    {
      label: 'Email',
      custom: (row: UserModel) => row.email,
    },
    {
      label: 'Contact Number',
      custom: (row: UserModel) => row.contactNumber,
    },
    {
      label: 'Role',
      custom: (row: UserModel) => {
        const role = row.role as UserRoleModel
        return role?.roleName || '-'
      },
    },
    {
      label: 'Designation',
      custom: (row: UserModel) => row.designation || '-',
    },
    {
      label: 'Status',
      custom: (row: UserModel) => (row.isActive ? 'Active' : 'Inactive'),
    },
  ]

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id)
      showToast('User deleted successfully', 'success')
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to delete user'
      showToast(errorMessage, 'error')
    }
  }

  // Filter function to disable edit/delete for admin user
  const canModifyUser = (row: UserModel) => {
    return !row.isAdmin
  }

  return (
    <div className={bemClass([blk])}>
      <PageHeader
        title="User List"
        total={usersData?.total || 0}
        btnRoute="/users/user-list/create"
        btnLabel="Add User"
      />

      <EntityGrid
        columns={columns}
        data={usersData?.data || []}
        isLoading={isLoading}
        deleteHandler={handleDelete}
        editRoute="/users/user-list"
        canEdit={canModifyUser}
        canDelete={canModifyUser}
      />
    </div>
  )
}

export default UserList

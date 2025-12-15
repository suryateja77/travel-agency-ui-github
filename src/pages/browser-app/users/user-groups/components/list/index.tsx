import React, { FunctionComponent, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserGroupsQuery, useDeleteUserGroupMutation } from '@api/queries/userGroup'
import { EntityGrid, PageHeader } from '@components'
import { bemClass, downloadFile } from '@utils'
import { useAuth } from '@contexts/AuthContext'
import { canEdit, canDelete } from '@utils'
import { useToast } from '@contexts/ToastContext'
import { Anchor } from '@base'
import { UserGroupModel } from '@types'

import './style.scss'

const blk = 'user-groups-list'

interface UserGroupListProps {}

const UserGroupsList: FunctionComponent<UserGroupListProps> = () => {
  const navigate = useNavigate()
  const { permissions } = useAuth()
  const hasEditPermission = canEdit(permissions, 'User Groups')
  const hasDeletePermission = canDelete(permissions, 'User Groups')
  const { showToast } = useToast()

  const { data: userGroupsData, isLoading, error } = useUserGroupsQuery()
  const deleteMutation = useDeleteUserGroupMutation()

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteMutation.mutateAsync(id)
        showToast('User group deleted successfully', 'success')
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || 'Failed to delete user group'
        showToast(errorMessage, 'error')
      }
    },
    [deleteMutation, showToast]
  )

  const handleExportExcel = () => {
    downloadFile('/user-group/export/excel', 'user-groups.xlsx')
  }

  const handleExportCSV = () => {
    downloadFile('/user-group/export/csv', 'user-groups.csv')
  }

  const handleExportPDF = () => {
    downloadFile('/user-group/export/pdf', 'user-groups.pdf')
  }

  const columns = [
    {
      label: 'Group Name',
      custom: (row: UserGroupModel) => (
        <Anchor href={`/users/user-groups/${row._id}`} asLink>
          {row.groupName}
        </Anchor>
      ),
    },
    {
      label: 'System Group',
      custom: (row: UserGroupModel) => (row.isSystemGroup ? 'Yes' : 'No'),
    },
    {
      label: 'Status',
      custom: (row: UserGroupModel) => (row.isActive ? 'Active' : 'Inactive'),
    },
  ]

  const canModifyGroup = (row: UserGroupModel) => {
    return !row.isSystemGroup
  }

  return (
    <div className={bemClass([blk])}>
      <PageHeader
        title="User Groups"
        total={userGroupsData?.total || 0}
        btnRoute={hasEditPermission ? '/users/user-groups/create' : undefined}
        btnLabel={hasEditPermission ? 'Add User Group' : undefined}
        showExport={true}
        onExportExcel={handleExportExcel}
        onExportCsv={handleExportCSV}
        onExportPdf={handleExportPDF}
      />
      <EntityGrid
        columns={columns}
        data={userGroupsData?.data || []}
        isLoading={isLoading}
        deleteHandler={hasDeletePermission ? handleDelete : undefined}
        editRoute={hasEditPermission ? '/users/user-groups' : undefined}
        canEdit={canModifyGroup}
        canDelete={canModifyGroup}
      />
    </div>
  )
}

export default UserGroupsList

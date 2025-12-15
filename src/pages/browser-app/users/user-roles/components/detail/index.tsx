import React, { FunctionComponent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Text, Breadcrumb, Button, Alert } from '@base'
import PageDetail from '@base/page-detail'
import { bemClass } from '@utils'
import { useUserRoleByIdQuery } from '@api/queries/userRole'
import { Panel } from '@types'
import Loader from '@components/loader'

import './style.scss'

const blk = 'user-role-detail'

interface UserRoleDetailProps {}

const UserRoleDetail: FunctionComponent<UserRoleDetailProps> = () => {
  const params = useParams()
  const navigate = useNavigate()

  const { data, isLoading, error } = useUserRoleByIdQuery(params.id || '')

  const breadcrumbData = [
    { label: 'Home', route: '/dashboard' },
    { label: 'Users' },
    { label: 'User Roles', route: '/users/user-roles' },
    { label: 'Details' },
  ]

  const pageDetailTemplate: Panel[] = [
    {
      panel: 'Role Information',
      fields: [
        { label: 'Role Name', path: 'roleName' },
        { label: 'System Role', path: 'isSystemRole' },
        { label: 'Status', path: 'isActive' },
      ],
    },
    {
      panel: 'Permissions',
      type: 'MULTIPLE',
      parentPath: 'permissions',
      fields: [
        { label: 'Module', path: 'module' },
        { label: 'View', path: 'view' },
        { label: 'Edit', path: 'edit' },
        { label: 'Delete', path: 'delete' },
      ],
    },
  ]

  const transformData = (data: any) => {
    return {
      roleName: data.roleName || '-',
      isSystemRole: data.isSystemRole ? 'Yes' : 'No',
      isActive: data.isActive ? 'Active' : 'Inactive',
      permissions: data.permissions?.map((p: any) => ({
        module: p.module || '-',
        view: p.view ? 'Yes' : 'No',
        edit: p.edit ? 'Yes' : 'No',
        delete: p.delete ? 'Yes' : 'No',
      })) || [],
    }
  }

  const handleEdit = () => {
    navigate(`/users/user-roles/edit/${params.id}`)
  }

  const handleBack = () => {
    navigate('/users/user-roles')
  }

  return (
    <div className={bemClass([blk])}>
      <div className={bemClass([blk, 'header'])}>
        <Text color="gray-darker" typography="l">
          User Role Details
        </Text>
        <Breadcrumb data={breadcrumbData} />
      </div>

      {isLoading ? (
        <Loader type="form" />
      ) : error ? (
        <>
          <Alert type="error" message="Unable to load user role details. Please try again later." />
          <div className={bemClass([blk, 'action-items'])}>
            <Button size="medium" clickHandler={handleBack}>
              Go Back
            </Button>
          </div>
        </>
      ) : data ? (
        <>
          <PageDetail pageDataTemplate={pageDetailTemplate} pageData={transformData(data)} />
        </>
      ) : null}
    </div>
  )
}

export default UserRoleDetail

import React, { FunctionComponent, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Text, Breadcrumb, Button, Alert } from '@base'
import PageDetail from '@base/page-detail'
import { bemClass } from '@utils'
import { useUserByIdQuery } from '@api/queries/user'
import { Panel, UserRoleModel } from '@types'
import Loader from '@components/loader'

import './style.scss'

const blk = 'user-detail'

interface UserDetailProps {}

const UserDetail: FunctionComponent<UserDetailProps> = () => {
  const params = useParams()
  const navigate = useNavigate()

  const { data, isLoading, error } = useUserByIdQuery(params.id || '')

  const breadcrumbData = [
    { label: 'Home', route: '/dashboard' },
    { label: 'Users' },
    { label: 'User List', route: '/users/user-list' },
    { label: 'Details' },
  ]

  const pageDetailTemplate: Panel[] = [
    {
      panel: 'User Information',
      fields: [
        { label: 'Name', path: 'name' },
        { label: 'Email', path: 'email' },
        { label: 'Contact Number', path: 'contactNumber' },
        { label: 'Designation', path: 'designation' },
        { label: 'User Role', path: 'roleName' },
        { label: 'Status', path: 'isActive' },
      ],
    },
  ]

  const transformData = (data: any) => {
    const role = data.role as UserRoleModel
    return {
      name: data.name || '-',
      email: data.email || '-',
      contactNumber: data.contactNumber || '-',
      designation: data.designation || '-',
      roleName: role?.roleName || '-',
      isActive: data.isActive ? 'Active' : 'Inactive',
    }
  }

  const handleEdit = () => {
    navigate(`/users/user-list/${params.id}/edit`)
  }

  const handleBack = () => {
    navigate('/users/user-list')
  }

  const userData = useMemo(() => {
    if (!data?.data) return null
    return data.data
  }, [data])

  return (
    <div className={bemClass([blk])}>
      <div className={bemClass([blk, 'header'])}>
        <Text color="gray-darker" typography="l">
          User Details
        </Text>
        <Breadcrumb data={breadcrumbData} />
      </div>

      {isLoading ? (
        <Loader type="form" />
      ) : error ? (
        <>
          <Alert type="error" message="Unable to load user details. Please try again later." />
          <div className={bemClass([blk, 'action-items'])}>
            <Button size="medium" clickHandler={handleBack}>
              Go Back
            </Button>
          </div>
        </>
      ) : userData ? (
        <PageDetail pageDataTemplate={pageDetailTemplate} pageData={transformData(userData)} />
      ) : null}
    </div>
  )
}

export default UserDetail

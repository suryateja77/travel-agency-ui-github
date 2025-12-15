import React, { FunctionComponent, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useUserGroupByIdQuery } from '@api/queries/userGroup'
import { PageDetail, Text, Breadcrumb, Button, Alert } from '@base'
import { bemClass, formatDateValueForDisplay } from '@utils'
import { useAuth } from '@contexts/AuthContext'
import { canEdit } from '@utils'
import Loader from '@components/loader'
import { detailTemplate } from './model/index'

import './style.scss'

const blk = 'user-group-detail'

interface UserGroupDetailProps {}

const UserGroupDetail: FunctionComponent<UserGroupDetailProps> = () => {
  const navigate = useNavigate()
  const params = useParams()
  const { permissions } = useAuth()
  const hasEditPermission = canEdit(permissions, 'User Groups')

  const { data: userGroup, isLoading, error } = useUserGroupByIdQuery(params.id || '')

  const breadcrumbData = [
    { label: 'Home', route: '/dashboard' },
    { label: 'Users' },
    { label: 'User Groups', route: '/users/user-groups' },
    { label: 'Details' },
  ]

  const transformedData = useMemo(() => {
    if (!userGroup) return {}
    const {groupName, isSystemGroup, isActive, createdAt} = userGroup?.data
    return {
      groupName: groupName || '-',
      isSystemGroup: isSystemGroup ? 'Yes' : 'No',
      isActive: isActive ? 'Active' : 'Inactive',
      createdAt: formatDateValueForDisplay(createdAt),
    }
  }, [userGroup])

  const handleEdit = () => {
    navigate(`/users/user-groups/edit/${params.id}`)
  }

  const handleBack = () => {
    navigate('/users/user-groups')
  }

  return (
    <div className={bemClass([blk])}>
      <div className={bemClass([blk, 'header'])}>
        <Text color="gray-darker" typography="l">
          User Group Details
        </Text>
        <Breadcrumb data={breadcrumbData} />
      </div>

      {isLoading ? (
        <Loader type="form" />
      ) : error ? (
        <>
          <Alert type="error" message="Unable to load user group details. Please try again later." />
          <div className={bemClass([blk, 'action-items'])}>
            <Button size="medium" clickHandler={handleBack}>
              Go Back
            </Button>
          </div>
        </>
      ) : userGroup ? (
        <>
          <PageDetail pageDataTemplate={detailTemplate} pageData={transformedData} />
        </>
      ) : null}
    </div>
  )
}

export default UserGroupDetail

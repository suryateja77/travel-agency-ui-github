import React, { FunctionComponent, useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useUserGroupByIdQuery, useCreateUserGroupMutation, useUpdateUserGroupMutation } from '@api/queries/userGroup'
import { Button, CheckBox, TextInput, Text, Breadcrumb, Alert, Panel, Row, Column, Toggle } from '@base'
import Loader from '@components/loader'
import { bemClass, validatePayload } from '@utils'
import { INITIAL_USER_GROUP, UserGroupModel } from '@types'
import { useToast } from '@contexts/ToastContext'
import { createValidationSchema } from './validation'

import './style.scss'

const blk = 'create-user-group'

interface CreateUserGroupProps {}

const UserGroupForm: FunctionComponent<CreateUserGroupProps> = () => {
  const navigate = useNavigate()
  const params = useParams()
  const { showToast } = useToast()
  const isEditing = !!params.id

  const [userGroup, setUserGroup] = useState<UserGroupModel>(INITIAL_USER_GROUP)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [isValidationError, setIsValidationError] = useState(false)
  const [submitButtonLoading, setSubmitButtonLoading] = useState(false)

  const { data: existingUserGroup, isLoading, error: fetchError } = useUserGroupByIdQuery(params.id || '')
  const createMutation = useCreateUserGroupMutation()
  const updateMutation = useUpdateUserGroupMutation()

  useEffect(() => {
    if (existingUserGroup && existingUserGroup.data) {
      setUserGroup({
        groupName: existingUserGroup.data.groupName,
        isActive: existingUserGroup.data.isActive,
      })
      setValidationErrors({})
      setIsValidationError(false)
    }
  }, [existingUserGroup])

  const handleGroupNameChange = useCallback((value: { groupName?: string }) => {
    setUserGroup(prev => ({
      ...prev,
      groupName: value.groupName || '',
    }))
  }, [])

  const navigateBack = useCallback(() => {
    navigate('/users/user-groups')
  }, [navigate])

  const handleSubmit = useCallback(async () => {
    try {
      setSubmitButtonLoading(true)

      const validationSchema = createValidationSchema(userGroup)
      const { isValid, errorMap } = validatePayload(validationSchema, userGroup)

      setValidationErrors(errorMap)
      setIsValidationError(!isValid)

      if (!isValid) {
        console.error('Validation Error', errorMap)
        setSubmitButtonLoading(false)
        return
      }

      if (isEditing) {
        const updateData = {
          _id: params.id!,
          groupName: userGroup.groupName,
          isActive: userGroup.isActive,
        }
        await updateMutation.mutateAsync(updateData)
        showToast('User group updated successfully', 'success')
      } else {
        await createMutation.mutateAsync(userGroup)
        showToast('User group created successfully', 'success')
      }
      setSubmitButtonLoading(false)
      navigateBack()
    } catch (error: any) {
      setSubmitButtonLoading(false)
      console.error('Unable to create/update user group', error)
      const errorMessage = error?.response?.data?.message || `Unable to ${isEditing ? 'update' : 'create'} user group. Please try again.`
      showToast(errorMessage, 'error')
    }
  }, [userGroup, isEditing, params.id, updateMutation, createMutation, showToast, navigateBack])

  const breadcrumbData = [
    { label: 'Home', route: '/dashboard' },
    { label: 'Users' },
    { label: 'User Groups', route: '/users/user-groups' },
    { label: `${isEditing ? 'Edit' : 'New'} User Group` },
  ]

  return (
    <div className={bemClass([blk])}>
      <div className={bemClass([blk, 'header'])}>
        <Text
          color="gray-darker"
          typography="l"
        >
          {isEditing ? 'Edit User Group' : 'Create User Group'}
        </Text>
        <Breadcrumb data={breadcrumbData} />
      </div>

      {isValidationError && (
        <Alert
          type="error"
          message="There is an error with submission, please correct errors indicated below."
          className={bemClass([blk, 'margin-bottom'])}
        />
      )}

      <div className={bemClass([blk, 'content'])}>
        {isLoading ? (
          <Loader type="form" />
        ) : fetchError ? (
          <>
            <Alert
              type="error"
              message="Unable to get the user group data. Please try again later."
              className={bemClass([blk, 'margin-bottom'])}
            />
            <Button
              size="medium"
              clickHandler={navigateBack}
            >
              Go Back
            </Button>
          </>
        ) : (
          <>
            <Panel
              title="Group Details"
              className={bemClass([blk, 'margin-bottom'])}
            >
              <Row>
                <Column
                  col={4}
                  className={bemClass([blk, 'margin-bottom'])}
                >
                  <TextInput
                    label="Group Name"
                    name="groupName"
                    value={userGroup.groupName}
                    changeHandler={handleGroupNameChange}
                    required
                    errorMessage={validationErrors.groupName}
                    invalid={!!validationErrors.groupName}
                  />
                </Column>
              </Row>
              <Row>
                <Column
                  col={4}
                  className={bemClass([blk, 'margin-bottom'])}
                >
                  <Toggle
                    className={bemClass([blk, 'toggle'])}
                    label="Is Active"
                    name="isActive"
                    checked={userGroup.isActive}
                    changeHandler={value => {
                      setUserGroup(prev => ({
                        ...prev,
                        isActive: !!value.isActive,
                      }))
                    }}
                  />
                </Column>
              </Row>
            </Panel>

            <div className={bemClass([blk, 'action-items'])}>
              <Button
                size="medium"
                category="default"
                className={bemClass([blk, 'margin-right'])}
                clickHandler={navigateBack}
                disabled={submitButtonLoading}
              >
                Cancel
              </Button>
              <Button
                size="medium"
                category="primary"
                clickHandler={handleSubmit}
                loading={submitButtonLoading}
              >
                {isEditing ? 'Update' : 'Submit'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default UserGroupForm

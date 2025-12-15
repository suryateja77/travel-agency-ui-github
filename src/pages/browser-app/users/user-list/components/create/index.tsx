import React, { FunctionComponent, useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Panel, Row, Column, TextInput, Button, Alert, Breadcrumb, SelectInput, Text, Toggle } from '@base'
import { bemClass, validatePayload } from '@utils'
import { useToast } from '@contexts/ToastContext'
import { useCreateUserMutation, useUpdateUserMutation, useUserByIdQuery } from '@api/queries/user'
import { useUserRolesQuery } from '@api/queries/userRole'
import { useUserGroupsQuery } from '@api/queries/userGroup'
import { UserModel, INITIAL_USER, UserGroupModel } from '@types'
import { createValidationSchema } from './validation'
import Loader from '@components/loader'

import './style.scss'

const blk = 'create-user'

interface CreateUserProps {}

const CreateUser: FunctionComponent<CreateUserProps> = () => {
  const navigate = useNavigate()
  const params = useParams()
  const { showToast } = useToast()

  const isEditing = !!params.id
  const [user, setUser] = useState<UserModel>(INITIAL_USER)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [isValidationError, setIsValidationError] = useState(false)

  // API Hooks
  const createMutation = useCreateUserMutation()
  const updateMutation = useUpdateUserMutation()
  const { data: userData, isLoading, error: fetchError } = useUserByIdQuery(params.id || '')
  const { data: userRolesData, isLoading: isLoadingRoles } = useUserRolesQuery()
  const { data: userGroupsData, isLoading: isLoadingUserGroups } = useUserGroupsQuery()

  // Load user data when editing
  useEffect(() => {
    console.log('User Data:', userData)
    console.log('Is Editing:', isEditing)
    if (isEditing && userData?.data) {
      const loadedUser = userData.data
      setUser({
        ...loadedUser,
        role: typeof loadedUser.role === 'object' ? loadedUser.role._id : loadedUser.role,
        userGroup: typeof loadedUser.userGroup === 'object' && loadedUser.userGroup !== null 
          ? loadedUser.userGroup._id 
          : loadedUser.userGroup,
      })
      setValidationErrors({})
      setIsValidationError(false)
    }
  }, [isEditing, userData])

  const userRoleOptions = useMemo(() => {
    const roles = userRolesData?.data || []
    return roles.map((role: any) => ({
      key: role._id,
      value: role.roleName,
    }))
  }, [userRolesData])

  const userGroupOptions = useMemo(() => {
    const groups = userGroupsData || []
    return groups.map((group: UserGroupModel) => ({
      key: group._id!,
      value: group.groupName,
    }))
  }, [userGroupsData])

  // Field-level validation to clear errors immediately
  const validateField = useCallback(
    (fieldPath: keyof UserModel, updatedData: UserModel) => {
      const validationSchema = createValidationSchema(updatedData, isEditing)
      const { errorMap } = validatePayload(validationSchema, updatedData)

      setValidationErrors(prev => {
        const newErrors = { ...prev }
        if (!errorMap[fieldPath]) {
          delete newErrors[fieldPath]
        } else {
          newErrors[fieldPath] = errorMap[fieldPath]
        }
        return newErrors
      })

      // Clear validation error alert if no errors remain
      const hasErrors = Object.keys({ ...validationErrors, [fieldPath]: errorMap[fieldPath] })
        .filter(key => key !== fieldPath)
        .some(key => validationErrors[key as keyof UserModel])

      if (!hasErrors && !errorMap[fieldPath]) {
        setIsValidationError(false)
      }
    },
    [validationErrors],
  )

  const handleInputChange = useCallback(
    (field: keyof UserModel) => (value: any) => {
      const updatedUser = {
        ...user,
        [field]: value[field] || '',
      }
      setUser(updatedUser)
    },
    [user],
  )

  const navigateBack = useCallback(() => {
    navigate('/users/user-list')
  }, [navigate])

  const handleSubmit = useCallback(async () => {
    const validationSchema = createValidationSchema(user, isEditing)
    const { isValid, errorMap } = validatePayload(validationSchema, user)

    setValidationErrors(errorMap)
    setIsValidationError(!isValid)

    if (!isValid) {
      console.error('Validation Error', errorMap)
      return
    }

    try {
      if (isEditing) {
        // Only send fields that should be updated (no password)
        const updateData = {
          _id: params.id!,
          name: user.name,
          contactNumber: user.contactNumber,
          email: user.email,
          designation: user.designation,
          role: user.role,
          userGroup: user.userGroup,
          isActive: user.isActive,
        }
        await updateMutation.mutateAsync(updateData as UserModel)
        showToast('User updated successfully!', 'success')
        navigateBack()
      } else {
        // For create, user sets the password
        const createData = {
          name: user.name,
          contactNumber: user.contactNumber,
          email: user.email,
          password: user.password,
          designation: user.designation,
          role: user.role,
          userGroup: user.userGroup,
          isActive: user.isActive,
        }
        await createMutation.mutateAsync(createData as Omit<UserModel, '_id'>)
        showToast('User created successfully!', 'success')
        navigateBack()
      }
    } catch (error: any) {
      console.error('Unable to create/update user', error)
      const errorMessage = error?.response?.data?.message || `Unable to ${isEditing ? 'update' : 'create'} user. Please try again.`
      showToast(errorMessage, 'error')
    }
  }, [user, isEditing, params.id, updateMutation, createMutation, showToast, navigateBack])

  const breadcrumbData = [
    { label: 'Home', route: '/dashboard' },
    { label: 'Users' },
    { label: 'User List', route: '/users/user-list' },
    { label: `${isEditing ? 'Edit' : 'New'} User` },
  ]

  return (
    <div className={bemClass([blk])}>
      <div className={bemClass([blk, 'header'])}>
        <Text
          color="gray-darker"
          typography="l"
        >
          {`${isEditing ? 'Edit' : 'New'} User`}
        </Text>
        <Breadcrumb data={breadcrumbData} />
      </div>

      {isValidationError && (
        <Alert
          type="error"
          message="There is an error with submission, please correct errors indicated below."
          className={bemClass([blk, 'alert'])}
        />
      )}

      <div className={bemClass([blk, 'content'])}>
        {isLoading || isLoadingRoles ? (
          <Loader type="form" />
        ) : fetchError ? (
          <>
            <Alert
              type="error"
              message="Unable to get the user data. Please try again later."
              className={bemClass([blk, 'alert'])}
            />
            <div className={bemClass([blk, 'action-items'])}>
              <Button
                size="medium"
                clickHandler={navigateBack}
              >
                Go Back
              </Button>
            </div>
          </>
        ) : (
          <Panel title={`${isEditing ? 'Edit' : 'Create New'} User`}>
            <Row>
              <Column
                col={3}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <TextInput
                  label="Name"
                  name="name"
                  value={user.name}
                  changeHandler={handleInputChange('name')}
                  onBlur={() => validateField('name', user)}
                  required
                  autoComplete="off"
                  errorMessage={validationErrors.name}
                  invalid={!!validationErrors.name}
                />
              </Column>
              <Column
                col={3}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <TextInput
                  label="Contact Number"
                  name="contactNumber"
                  value={user.contactNumber}
                  changeHandler={handleInputChange('contactNumber')}
                  onBlur={() => validateField('contactNumber', user)}
                  required
                  autoComplete="off"
                  errorMessage={validationErrors.contactNumber}
                  invalid={!!validationErrors.contactNumber}
                />
              </Column>
              <Column
                col={3}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <TextInput
                  label="Email"
                  name="email"
                  type="email"
                  value={user.email}
                  changeHandler={handleInputChange('email')}
                  onBlur={() => validateField('email', user)}
                  required
                  autoComplete="off"
                  errorMessage={validationErrors.email}
                  invalid={!!validationErrors.email}
                />
              </Column>
              {!isEditing && (
                <Column
                  col={3}
                  className={bemClass([blk, 'margin-bottom'])}
                >
                  <TextInput
                    label="Password"
                    name="password"
                    type="password"
                    value={user.password || ''}
                    changeHandler={handleInputChange('password')}
                    onBlur={() => validateField('password', user)}
                    required
                    autoComplete="new-password"
                    errorMessage={validationErrors.password}
                    invalid={!!validationErrors.password}
                  />
                </Column>
              )}
              <Column
                col={3}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <TextInput
                  label="Designation"
                  name="designation"
                  value={user.designation || ''}
                  changeHandler={handleInputChange('designation')}
                  onBlur={() => validateField('designation', user)}
                  autoComplete="off"
                />
              </Column>
            </Row>
            <Row>
              <Column
                col={3}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <SelectInput
                  label="User Role"
                  name="role"
                  options={isLoadingRoles
                    ? [{ key: 'loading', value: 'Please wait...' }]
                    : userRoleOptions.length > 0
                      ? userRoleOptions
                      : [{ key: 'no-data', value: 'No roles found' }]
                  }
                  value={
                    user.role
                      ? typeof user.role === 'string'
                        ? (userRoleOptions.find((option: any) => option.key === user.role) as any)?.value ?? ''
                        : (userRoleOptions.find((option: any) => option.key === (user.role as any)._id) as any)?.value ?? ''
                      : ''
                  }
                  changeHandler={value => {
                    const selectedOption = userRoleOptions.find((option: any) => option.value === value.role) as any
                    if (!selectedOption || ['Please wait...', 'No roles found'].includes(selectedOption.value)) {
                      return
                    }
                    const updatedUser = { ...user, role: selectedOption.key }
                    setUser(updatedUser)
                    setTimeout(() => validateField('role', updatedUser), 0)
                  }}
                  required
                  errorMessage={validationErrors.role}
                  invalid={!!validationErrors.role}
                />
              </Column>
              <Column
                col={3}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <SelectInput
                  label="User Group"
                  name="userGroup"
                  options={isLoadingUserGroups
                    ? [{ key: 'loading', value: 'Please wait...' }]
                    : userGroupOptions.length > 0
                      ? [{ key: '', value: 'None' }, ...userGroupOptions]
                      : [{ key: 'no-data', value: 'No groups found' }]
                  }
                  value={
                    user.userGroup
                      ? typeof user.userGroup === 'string'
                        ? (userGroupOptions.find((option: any) => option.key === user.userGroup) as any)?.value ?? ''
                        : (userGroupOptions.find((option: any) => option.key === (user.userGroup as any)._id) as any)?.value ?? ''
                      : 'None'
                  }
                  changeHandler={value => {
                    const selectedOption = value.userGroup === 'None' 
                      ? null 
                      : userGroupOptions.find((option: any) => option.value === value.userGroup) as any
                    
                    if (selectedOption && ['Please wait...', 'No groups found'].includes(selectedOption.value)) {
                      return
                    }
                    const updatedUser = { ...user, userGroup: selectedOption ? selectedOption.key : null }
                    setUser(updatedUser)
                    setTimeout(() => validateField('userGroup', updatedUser), 0)
                  }}
                />
              </Column>
              <Column
                col={3}
                className={bemClass([blk, 'margin-bottom'])}
              >
                <Toggle
                  className={bemClass([blk, 'toggle'])}
                  label="User Active Status"
                  name="isActive"
                  checked={user.isActive}
                  changeHandler={value => {
                    setUser({
                      ...user,
                      isActive: !!value.isActive,
                    })
                  }}
                />
              </Column>
            </Row>
          </Panel>
        )}
        <div className={bemClass([blk, 'action-items'])}>
          <Button
            size="medium"
            category="default"
            clickHandler={navigateBack}
          >
            Cancel
          </Button>
          <Button
            size="medium"
            category="primary"
            clickHandler={handleSubmit}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending ? (isEditing ? 'Updating...' : 'Creating...') : isEditing ? 'Update User' : 'Create User'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CreateUser

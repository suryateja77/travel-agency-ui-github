import React, { FunctionComponent, useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Panel, Row, Column, TextInput, Button, Alert, Breadcrumb, Text, CheckBox } from '@base'
import { bemClass, validatePayload } from '@utils'
import { useToast } from '@contexts/ToastContext'
import {
  useCreateUserRoleMutation,
  useUpdateUserRoleMutation,
  useUserRoleByIdQuery,
} from '@api/queries/userRole'
import { UserRoleModel, INITIAL_USER_ROLE, MODULES, ModuleName } from '@types'
import { createValidationSchema } from './validation'
import Loader from '@components/loader'

import './style.scss'

const blk = 'create-user-role'

interface CreateUserRoleProps {}

const CreateUserRole: FunctionComponent<CreateUserRoleProps> = () => {
  const navigate = useNavigate()
  const params = useParams()
  const { showToast } = useToast()

  const isEditing = !!params.id
  const [userRole, setUserRole] = useState<UserRoleModel>(INITIAL_USER_ROLE)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [isValidationError, setIsValidationError] = useState(false)

  // API Hooks
  const createMutation = useCreateUserRoleMutation()
  const updateMutation = useUpdateUserRoleMutation()
  const { data: userRoleData, isLoading, error: fetchError } = useUserRoleByIdQuery(params.id || '')

  // Load user role data when editing
  useEffect(() => {
    if (userRoleData) {
      setUserRole(userRoleData)
      setValidationErrors({})
      setIsValidationError(false)
    }
  }, [userRoleData])

  const handleRoleNameChange = useCallback((value: { roleName?: string }) => {
    setUserRole(prev => ({
      ...prev,
      roleName: value.roleName || '',
    }))
  }, [])

  const handlePermissionChange = useCallback((module: ModuleName, permissionType: 'view' | 'edit' | 'delete') => {
    setUserRole(prev => {
      const updatedPermissions = prev.permissions.map(p => {
        if (p.module === module) {
          const updated = { ...p, [permissionType]: !p[permissionType] }
          // If unchecking view, uncheck edit and delete too
          if (permissionType === 'view' && !updated.view) {
            updated.edit = false
            updated.delete = false
          }
          // If checking edit or delete, check view too
          if ((permissionType === 'edit' || permissionType === 'delete') && updated[permissionType]) {
            updated.view = true
          }
          return updated
        }
        return p
      })
      return { ...prev, permissions: updatedPermissions }
    })
  }, [])

  const handleSelectAll = useCallback((permissionType: 'view' | 'edit' | 'delete') => {
    setUserRole(prev => {
      const allChecked = prev.permissions.every(p => p[permissionType])
      const updatedPermissions = prev.permissions.map(p => {
        if (allChecked) {
          // Uncheck all
          const updated = { ...p, [permissionType]: false }
          // If unchecking view, uncheck others too
          if (permissionType === 'view') {
            updated.edit = false
            updated.delete = false
          }
          return updated
        } else {
          // Check all
          const updated = { ...p, [permissionType]: true }
          // If checking edit or delete, check view too
          if (permissionType === 'edit' || permissionType === 'delete') {
            updated.view = true
          }
          return updated
        }
      })
      return { ...prev, permissions: updatedPermissions }
    })
  }, [])

  const navigateBack = useCallback(() => {
    navigate('/users/user-roles')
  }, [navigate])

  const handleSubmit = useCallback(async () => {
    const validationSchema = createValidationSchema(userRole)
    const { isValid, errorMap } = validatePayload(validationSchema, userRole)

    setValidationErrors(errorMap)
    setIsValidationError(!isValid)

    if (!isValid) {
      console.error('Validation Error', errorMap)
      return
    }

    try {
      if (isEditing) {
        // Only send fields that should be updated
        const updateData = {
          _id: params.id!,
          roleName: userRole.roleName,
          permissions: userRole.permissions
        }
        await updateMutation.mutateAsync(updateData)
        showToast('User role updated successfully!', 'success')
      } else {
        // For create, only send roleName and permissions
        const createData = {
          roleName: userRole.roleName,
          permissions: userRole.permissions
        }
        await createMutation.mutateAsync(createData)
        showToast('User role created successfully!', 'success')
      }
      navigateBack()
    } catch (error: any) {
      console.error('Unable to create/update user role', error)
      const errorMessage =
        error?.response?.data?.message || `Unable to ${isEditing ? 'update' : 'create'} user role. Please try again.`
      showToast(errorMessage, 'error')
    }
  }, [userRole, isEditing, params.id, updateMutation, createMutation, showToast, navigateBack])

  const breadcrumbData = [
    { label: 'Home', route: '/dashboard' },
    { label: 'Users' },
    { label: 'User Roles', route: '/users/user-roles' },
    { label: `${isEditing ? 'Edit' : 'New'} User Role` },
  ]

  const allViewChecked = userRole.permissions.every(p => p.view)
  const allEditChecked = userRole.permissions.every(p => p.edit)
  const allDeleteChecked = userRole.permissions.every(p => p.delete)

  return (
    <div className={bemClass([blk])}>
      <div className={bemClass([blk, 'header'])}>
        <Text color="gray-darker" typography="l">
          {`${isEditing ? 'Edit' : 'New'} User Role`}
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
              message="Unable to get the user role data. Please try again later."
              className={bemClass([blk, 'margin-bottom'])}
            />
            <Button size="medium" clickHandler={navigateBack}>
              Go Back
            </Button>
          </>
        ) : (
          <>
            <Panel title="Role Details" className={bemClass([blk, 'margin-bottom'])}>
              <Row>
                <Column col={4} className={bemClass([blk, 'margin-bottom'])}>
                  <TextInput
                    label="Role Name"
                    name="roleName"
                    value={userRole.roleName}
                    changeHandler={handleRoleNameChange}
                    required
                    errorMessage={validationErrors['roleName']}
                    invalid={!!validationErrors['roleName']}
                  />
                </Column>
              </Row>
            </Panel>

            <Panel title="Permissions" className={bemClass([blk, 'margin-bottom'])}>
              <div className={bemClass([blk, 'permissions-grid'])}>
                {/* Header Row */}
                <div className={bemClass([blk, 'permissions-header'])}>
                  <Text fontWeight='bold' className={bemClass([blk, 'permission-module'])}>Module</Text>
                  <div className={bemClass([blk, 'permission-action'])}>
                    <CheckBox
                      id="selectAllView"
                      label="View"
                      checked={allViewChecked}
                      changeHandler={() => handleSelectAll('view')}
                    />
                  </div>
                  <div className={bemClass([blk, 'permission-action'])}>
                    <CheckBox
                      id="selectAllEdit"
                      label="Edit"
                      checked={allEditChecked}
                      changeHandler={() => handleSelectAll('edit')}
                    />
                  </div>
                  <div className={bemClass([blk, 'permission-action'])}>
                    <CheckBox
                      id="selectAllDelete"
                      label="Delete"
                      checked={allDeleteChecked}
                      changeHandler={() => handleSelectAll('delete')}
                    />
                  </div>
                </div>

                {/* Permission Rows */}
                {MODULES.map((module, index) => {
                  const permission = userRole.permissions.find(p => p.module === module)
                  if (!permission) return null

                  return (
                    <div key={module} className={bemClass([blk, 'permission-row', index % 2 === 0 ? ['even'] : []])}>
                      <div className={bemClass([blk, 'permission-module'])}>{module}</div>
                      <div className={bemClass([blk, 'permission-action'])}>
                        <CheckBox
                          id={`${module}-view`}
                          label=""
                          checked={permission.view}
                          changeHandler={() => handlePermissionChange(module, 'view')}
                        />
                      </div>
                      <div className={bemClass([blk, 'permission-action'])}>
                        <CheckBox
                          id={`${module}-edit`}
                          label=""
                          checked={permission.edit}
                          changeHandler={() => handlePermissionChange(module, 'edit')}
                        />
                      </div>
                      <div className={bemClass([blk, 'permission-action'])}>
                        <CheckBox
                          id={`${module}-delete`}
                          label=""
                          checked={permission.delete}
                          changeHandler={() => handlePermissionChange(module, 'delete')}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </Panel>

            <div className={bemClass([blk, 'action-items'])}>
              <Button size="medium" category="default" className={bemClass([blk, 'margin-right'])} clickHandler={navigateBack}>
                Cancel
              </Button>
              <Button size="medium" category="primary" clickHandler={handleSubmit}>
                {isEditing ? 'Update' : 'Submit'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default CreateUserRole

import React, { FunctionComponent, useState, useEffect, useCallback, useMemo } from 'react'
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
import { NAVIGATION_DATA } from '@config/navigation'

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
  const [submitButtonLoading, setSubmitButtonLoading] = useState(false)

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

  const handleSelectAllForModule = useCallback((module: ModuleName) => {
    setUserRole(prev => {
      const permission = prev.permissions.find(p => p.module === module)
      if (!permission) return prev

      const allChecked = permission.view && permission.edit && permission.delete
      const updatedPermissions = prev.permissions.map(p => {
        if (p.module === module) {
          return {
            ...p,
            view: !allChecked,
            edit: !allChecked,
            delete: !allChecked
          }
        }
        return p
      })
      return { ...prev, permissions: updatedPermissions }
    })
  }, [])

  const navigateBack = useCallback(() => {
    navigate('/users/user-roles')
  }, [navigate])

  const handleSubmit = useCallback(async () => {
    try {
      setSubmitButtonLoading(true)
      
      const validationSchema = createValidationSchema(userRole)
      const { isValid, errorMap } = validatePayload(validationSchema, userRole)

      setValidationErrors(errorMap)
      setIsValidationError(!isValid)

      if (!isValid) {
        console.error('Validation Error', errorMap)
        setSubmitButtonLoading(false)
        return
      }

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
      setSubmitButtonLoading(false)
      navigateBack()
    } catch (error: any) {
      setSubmitButtonLoading(false)
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

  // Helper function to render permission row
  const renderPermissionRow = useCallback((module: ModuleName, isSubRoute: boolean) => {
    const permission = userRole.permissions.find(p => p.module === module)
    if (!permission) return null

    const allModulePermissionsChecked = permission.view && permission.edit && permission.delete

    return (
      <div key={module} className={bemClass([blk, 'permission-row', !isSubRoute ? ['standalone'] : []])}>
        <div className={bemClass([blk, 'permission-module'])}>
          {isSubRoute && <span className={bemClass([blk, 'arrow-prefix'])}>↳ </span>}
          <CheckBox
            id={`${module}-select-all`}
            label={module.toUpperCase()}
            checked={allModulePermissionsChecked}
            changeHandler={() => handleSelectAllForModule(module)}
            className={bemClass([blk, 'module-select-checkbox', !isSubRoute ? ['standalone-label'] : []])}
          />
        </div>
        <div className={bemClass([blk, 'permission-actions'])}>
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
      </div>
    )
  }, [userRole.permissions, handlePermissionChange, handleSelectAllForModule])

  // Mapping function from navigation names to permission module names
  const getModuleName = useCallback((routeName: string, subRouteName?: string): ModuleName | null => {
    const mappings: Record<string, ModuleName> = {
      'Dashboard': 'Dashboard',
      'Suppliers': 'Suppliers',
      'Customers': 'Customers',
      'Vehicles': 'Vehicles',
      'Packages': 'Packages',
      'Staff': 'Staff',
      'Expenses': 'Expenses',
      'Advance Booking': 'Advance Bookings',
      'Advance Payments': 'Advance Payments',
      // Sub-routes for Requests
      'Requests-Regular': 'Regular Requests',
      'Requests-Monthly Fixed': 'Monthly Fixed Requests',
      // Sub-routes for Payments
      'Payments-Vehicle': 'Vehicle Payments',
      'Payments-Staff': 'Staff Payments',
      'Payments-Supplier': 'Supplier Payments',
      // Sub-routes for Reports
      'Reports-Business': 'Business Reports',
      'Reports-Vehicle': 'Vehicle Reports',
      // Sub-routes for Users
      'Users-User List': 'User List',
      'Users-User Roles': 'User Roles',
      'Users-User Groups': 'User Groups',
      // Sub-routes for Settings
      'Settings-Configurations': 'Configurations',
      'Settings-Profile': 'Profile',
    }

    const key = subRouteName ? `${routeName}-${subRouteName}` : routeName
    return mappings[key] || null
  }, [])

  // Generate permission rows from NAVIGATION_DATA
  const permissionRows = useMemo(() => {
    const rows: JSX.Element[] = []
    const routes = NAVIGATION_DATA[0].routes // Use routes from first group
    const sectionsWithDividers = ['Requests', 'Payments', 'Reports'] // Add divider after these

    routes.forEach((route) => {
      // Route with sub-routes (show as section label + sub-routes)
      if (route.subRoutes && route.subRoutes.length > 0) {
        // Section label (no checkboxes)
        rows.push(
          <div key={`section-${route.name}`} className={bemClass([blk, 'permission-section'])}>
            <Text fontWeight='bold' color='gray-dark'>{route.name.toUpperCase()}</Text>
          </div>
        )

        // Sub-routes with checkboxes
        route.subRoutes.forEach((subRoute) => {
          const moduleName = getModuleName(route.name, subRoute.name)
          if (moduleName) {
            const row = renderPermissionRow(moduleName, true)
            if (row) rows.push(row)
          }
        })

        // Add divider after specific sections
        if (sectionsWithDividers.includes(route.name)) {
          rows.push(
            <div key={`divider-${route.name}`} className={bemClass([blk, 'section-divider'])}></div>
          )
        }
      } else {
        // Route without sub-routes (standalone with checkboxes)
        const moduleName = getModuleName(route.name)
        if (moduleName) {
          const row = renderPermissionRow(moduleName, false)
          if (row) rows.push(row)
        }
      }
    })

    return rows
  }, [renderPermissionRow, getModuleName])

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

            <Panel title="Permissions">
              <div className={bemClass([blk, 'permissions-container'])}>
                {/* Header Row - Text Labels Only */}
                <div className={bemClass([blk, 'permissions-header'])}>
                  <div className={bemClass([blk, 'permission-module'])}>
                    <Text fontWeight='bold' color='gray-darker'>MODULE</Text>
                  </div>
                  <div className={bemClass([blk, 'permission-actions'])}>
                    <div className={bemClass([blk, 'permission-action'])}>
                      <Text fontWeight='bold' color='gray-darker'>View</Text>
                    </div>
                    <div className={bemClass([blk, 'permission-action'])}>
                      <Text fontWeight='bold' color='gray-darker'>Edit</Text>
                    </div>
                    <div className={bemClass([blk, 'permission-action'])}>
                      <Text fontWeight='bold' color='gray-darker'>Delete</Text>
                    </div>
                  </div>
                </div>

                {/* Permission Rows */}
                <div className={bemClass([blk, 'permissions-grid'])}>
                  {/* All Modules Row - Select All */}
                  <div className={bemClass([blk, 'permission-row', ['all-modules']])}>
                    <div className={bemClass([blk, 'permission-module'])}>
                      <Text fontWeight='bold' color='gray-darker'>ALL MODULES</Text>
                    </div>
                    <div className={bemClass([blk, 'permission-actions'])}>
                      <div className={bemClass([blk, 'permission-action'])}>
                        <CheckBox
                          id="selectAllView"
                          label=""
                          checked={allViewChecked}
                          changeHandler={() => handleSelectAll('view')}
                        />
                      </div>
                      <div className={bemClass([blk, 'permission-action'])}>
                        <CheckBox
                          id="selectAllEdit"
                          label=""
                          checked={allEditChecked}
                          changeHandler={() => handleSelectAll('edit')}
                        />
                      </div>
                      <div className={bemClass([blk, 'permission-action'])}>
                        <CheckBox
                          id="selectAllDelete"
                          label=""
                          checked={allDeleteChecked}
                          changeHandler={() => handleSelectAll('delete')}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Permission Rows - Dynamically generated from NAVIGATION_DATA */}
                  {permissionRows}
                </div>
              </div>
            </Panel>

            <div className={bemClass([blk, 'action-items'])}>
              <Button size="medium" category="default" className={bemClass([blk, 'margin-right'])} clickHandler={navigateBack} disabled={submitButtonLoading}>
                Cancel
              </Button>
              <Button size="medium" category="primary" clickHandler={handleSubmit} loading={submitButtonLoading}>
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

# Travel Agency Management System - Frontend Development Guide

React TypeScript frontend for **multi-organization** travel agency management system. Data is scoped by `clientId` (organization), not individual users.

## Critical Architecture - Multi-Organization Model

### Client-User Hierarchy

This frontend serves **multiple travel agency organizations** (Clients), each with their own users and data:

```
Client (Travel Agency Organization)
├── Admin User (clientId.adminUserId)
├── Multiple Users (staff members)
├── UserRoles (custom role definitions)
├── UserGroups (organizational groupings)
└── All Data (scoped by clientId)
```

**Key Frontend Principles**:
- **Client** = Travel agency organization (e.g., "ABC Travels")
- **User** = Individual person within that organization (admin, manager, operator)
- **Data Isolation** = All API calls return data filtered by `clientId`
- **Permission Control** = UI elements shown/hidden based on user's role permissions
- **UserGroup** = Optional organizational grouping for users (separate from roles)
- **isAdmin** = Calculated flag (user._id === client.adminUserId), controls access to client settings

---

## Environment Variables (CRITICAL)

**ALL configuration MUST use environment variables**:

```env
# .env file (required)
REACT_APP_API_URL=https://travel-agency-api-7l66.onrender.com
PORT=4040
```

**Webpack Configuration**:
```javascript
// webpack.common.js - Inject env vars
require('dotenv').config()
new DefinePlugin({
  'process.env.REACT_APP_API_URL': JSON.stringify(process.env.REACT_APP_API_URL)
})

// webpack.dev.js - Dev server & proxy
require('dotenv').config()
devServer: {
  port: process.env.PORT,  // No fallback
  proxy: [{
    target: process.env.REACT_APP_API_URL  // No fallback
  }]
}
```

**API Configuration**:
```typescript
// src/api/index.ts
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,  // No fallback - env driven
  timeout: 20000
})
```

❌ **NEVER hardcode URLs or use fallback values** (e.g., `|| 'https://...'`)  
✅ **ALWAYS require .env file** - app should fail if missing

---

## Essential Patterns

### Path/Name Conversion (Used Everywhere)

Category names convert between display and URL formats:

```typescript
import { nameToPath, pathToName } from '@utils'

nameToPath('Regular Customer') → 'regular-customer'  // For URLs, DB
pathToName('regular-customer') → 'Regular Customer'  // For display
```

**Where Used**:
- URL routing: `/customers/regular-customer`
- API requests: `category: nameToPath('Regular Customer')`
- Display: `pathToName(data.category)`

### BEM Class Generation

Use `bemClass` utility, never write class strings manually:

```typescript
import { bemClass } from '@utils'

const blk = 'customer-form'

className={bemClass([blk])}                     // 'customer-form'
className={bemClass([blk, 'header'])}           // 'customer-form__header'
className={bemClass([blk, ['editing']])}        // 'customer-form customer-form--editing'
className={bemClass([blk, 'input', ['error']])} // 'customer-form__input customer-form__input--error'

// Conditional modifiers
className={bemClass([blk, 'field', [isDisabled ? 'disabled' : undefined]])}
```

**BEM Naming Convention**:
- Block: `.customer-form`
- Element: `.customer-form__header`
- Modifier: `.customer-form--editing`
- Element Modifier: `.customer-form__input--error`

### Disabled Field Pattern (Critical)

For fields that are conditionally editable (e.g., admin-only fields):

```typescript
// 1. Determine editability
const isEditable = userProfile.isAdmin  // or role-based check

// 2. Apply disabled prop + CSS class
<TextInput
  label="Agency Name"
  value={formData.agencyName}
  onChange={(value) => handleChange('agencyName', value)}
  disabled={!isEditable}  // Boolean prop
  className={bemClass([blk, 'input', [!isEditable ? 'disabled' : undefined]])}
/>

// 3. SCSS styling
.profile-form {
  &__input {
    &--disabled {
      opacity: 0.6;
      cursor: not-allowed;
      background-color: $bg-tertiary;
      pointer-events: none;  // Prevent interactions
    }
  }
}
```

**Why Both**:
- `disabled` prop = Browser-level protection
- CSS class = Visual feedback to user
- `pointer-events: none` = Prevent accidental clicks

---

## Frontend Essentials

### Required Import Pattern

```typescript
// ALWAYS use webpack aliases
import { Button, TextInput, SelectInput } from '@base'   // NOT '../../../base/button'
import { EntityGrid, PageHeader } from '@components'
import { bemClass, validatePayload, formatNumber } from '@utils'
import { useCustomersQuery, useCreateCustomerMutation } from '@api/queries/customer'

// For charts (Recharts library)
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts'
```

**Webpack Aliases** (configured in webpack.common.js):
- `@base` → `src/base`
- `@components` → `src/components`
- `@utils` → `src/utils`
- `@api` → `src/api`
- `@types` → `src/types`
- `@config` → `src/config`
- `@contexts` → `src/contexts`

### React Query is Mandatory for API

Never use axios directly in components:

```typescript
// ✅ Correct - React Query hooks
const { data, isLoading, error } = useCustomersQuery()
const createMutation = useCreateCustomerMutation()

await createMutation.mutateAsync(formData)

// ❌ Wrong - Don't do this
axios.get('/api/customer')
```

### Standard Component Structure

```typescript
// 1. Imports
import React, { useState, useCallback, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { bemClass, validatePayload } from '@utils'
import { TextInput, Button } from '@base'

// 2. Constants outside component
const blk = 'customer-form'
const INITIAL_STATE = { name: '', contact: '' }

// 3. Component
const CustomerForm = ({ category }) => {
  // a. Route hooks first
  const navigate = useNavigate()
  const params = useParams()
  
  // b. State hooks
  const [formData, setFormData] = useState(INITIAL_STATE)
  const [errors, setErrors] = useState({})
  
  // c. Query/mutation hooks
  const createMutation = useCreateCustomerMutation()
  const { data: existingData } = useCustomerByIdQuery(params.id || '')
  
  // d. Effects
  useEffect(() => {
    if (existingData) setFormData(existingData)
  }, [existingData])
  
  // e. Memoized callbacks
  const handleSubmit = useCallback(async () => {
    // Validation
    const { isValid, errorMap } = validatePayload(validationSchema, formData)
    if (!isValid) {
      setErrors(errorMap)
      return
    }
    
    // Submit
    try {
      await createMutation.mutateAsync(formData)
      navigate('/customers')
    } catch (error) {
      setError(error.response?.data?.message || 'Failed')
    }
  }, [formData, createMutation, navigate])
  
  return (
    <div className={bemClass([blk])}>
      {/* JSX */}
    </div>
  )
}

export default CustomerForm
```

### Form Validation Pattern

```typescript
import { validatePayload, validateField } from '@utils'

// Schema definition
const validationSchema = (data) => [
  emptyField('name'),
  emptyField('contact'),
  emailField('email'),  // Optional validation for email format
  customValidator((d) => d.age >= 18, 'age', 'Must be 18 or older')
]

// Full form validation
const handleSubmit = async () => {
  // 1. Validate with schema
  const { isValid, errorMap } = validatePayload(validationSchema, formData)
  if (!isValid) {
    setErrors(errorMap)
    return
  }
  
  // 2. Transform data (convert category to path format)
  const dataToSave = { ...formData, category: nameToPath(category) }
  
  // 3. Submit with mutation
  try {
    await createMutation.mutateAsync(dataToSave)
    navigate('/success')
  } catch (error) {
    setError(error.response?.data?.message || 'Failed')
  }
}

// Field-level validation
const handleChange = (field, value) => {
  setFormData({ ...formData, [field]: value })
  
  // Clear error for this field
  const error = validateField(validationSchema, formData, field, value)
  setErrors({ ...errors, [field]: error })
}
```

### SCSS Requirements

Every component SCSS file must:

```scss
@import '~/src/sass/style';  // REQUIRED - imports variables, mixins

.customer-form {  // BEM block
  padding: $spacing-md;
  
  &__header {     // BEM element
    color: $text-primary;
    font-size: $font-size-lg;
  }
  
  &__input {
    margin-bottom: $spacing-sm;
    
    &--error {    // BEM element modifier
      border-color: $error-color;
    }
    
    &--disabled {  // BEM element modifier
      opacity: 0.6;
      cursor: not-allowed;
      background-color: $bg-tertiary;
      pointer-events: none;
    }
  }
  
  &--editing {    // BEM block modifier
    background: $bg-secondary;
  }
  
  // Responsive breakpoints
  @include respond-to('tablet') {
    padding: $spacing-sm;
  }
}
```

**Available Variables** (from src/sass/_variables.scss):
- Colors: `$primary-color`, `$text-primary`, `$bg-primary`, `$error-color`
- Spacing: `$spacing-xs`, `$spacing-sm`, `$spacing-md`, `$spacing-lg`
- Font sizes: `$font-size-sm`, `$font-size-md`, `$font-size-lg`

**Available Mixins** (from src/sass/_mixins.scss):
- `@include respond-to('mobile' | 'tablet' | 'desktop')`
- `@include flex-center`
- `@include truncate`

---

## Role-Based Access Control (RBAC)

### Granular Permission System

The system implements **granular sub-route level permissions** for fine-grained access control:

**21 Permission Modules** (independent permissions for each):

```typescript
export type ModuleName =
  | 'Dashboard'
  | 'Regular Requests'              // Granular: split from 'Requests'
  | 'Monthly Fixed Requests'         // Granular: split from 'Requests'
  | 'Packages'
  | 'Vehicles'
  | 'Staff'
  | 'Customers'
  | 'Expenses'
  | 'Vehicle Payments'              // Granular: split from 'Payments'
  | 'Staff Payments'                // Granular: split from 'Payments'
  | 'Supplier Payments'             // Granular: split from 'Payments'
  | 'Business Reports'              // Granular: split from 'Reports'
  | 'Vehicle Reports'               // Granular: split from 'Reports'
  | 'Advance Bookings'
  | 'Advance Payments'
  | 'User List'                     // Granular: split from Users
  | 'User Roles'                    // Granular: split from Users
  | 'User Groups'                   // Granular: split from Users
  | 'Suppliers'
  | 'Configurations'                // Granular: split from Settings
  | 'Profile'                       // Granular: split from Settings
```

**Permission Structure**:
```typescript
interface Permission {
  module: ModuleName
  view: boolean    // Can see navigation item and view pages
  edit: boolean    // Can create/update records
  delete: boolean  // Can delete records
}
```

### Permission Utilities

**Core Functions** (`src/utils/permissions.ts`):

```typescript
import { canView, canEdit, canDelete, hasModuleAccess } from '@utils'
import { useAuth } from '@contexts/AuthContext'

// In components
const { permissions } = useAuth()

// Check specific permissions
const canViewCustomers = canView(permissions, 'Customers')
const canEditRequests = canEdit(permissions, 'Regular Requests')
const canDeletePayments = canDelete(permissions, 'Vehicle Payments')

// Check any access (used for navigation)
const hasAccessToReports = hasModuleAccess(permissions, 'Business Reports')
```

**Route-to-Module Mapping**:
```typescript
// SUB_ROUTE_MODULE_NAMES in permissions.ts
'/requests/regular' → 'Regular Requests'
'/requests/monthly-fixed' → 'Monthly Fixed Requests'
'/payments/vehicle' → 'Vehicle Payments'
'/payments/staff' → 'Staff Payments'
'/payments/supplier' → 'Supplier Payments'
'/reports/business' → 'Business Reports'
'/reports/vehicle' → 'Vehicle Reports'
'/users/user-list' → 'User List'
'/users/user-roles' → 'User Roles'
'/users/user-groups' → 'User Groups'
'/settings/configurations' → 'Configurations'
'/settings/profile' → 'Profile'
```

### Three-Layer Protection

**1. Navigation Filtering** (side-navigator):
```typescript
// Automatically filters navigation items based on view permissions
// Sub-routes only appear if user has specific permission
const filteredNavigationData = useMemo(() => {
  return NAVIGATION_DATA.map(navGroup => ({
    ...navGroup,
    routes: navGroup.routes.map(route => {
      // Filter sub-routes based on granular permissions
      const filteredSubRoutes = route.subRoutes?.filter(subRoute => {
        const moduleName = getModuleNameForSubRoute(route.path, subRoute.path, subRoute.name)
        return hasModuleAccess(permissions, moduleName)
      })
      // Only show parent if at least one sub-route is accessible
      return filteredSubRoutes?.length > 0 ? { ...route, subRoutes: filteredSubRoutes } : null
    }).filter(Boolean)
  }))
}, [permissions])
```

**2. UI Controls** (list components):
```typescript
// List component pattern with permission checks
const CustomerList = () => {
  const { permissions } = useAuth()
  const hasEditPermission = canEdit(permissions, 'Customers')
  const hasDeletePermission = canDelete(permissions, 'Customers')
  
  return (
    <>
      <PageHeader
        title="Customers"
        btnRoute={hasEditPermission ? "/customers/create" : undefined}
        btnLabel={hasEditPermission ? "Add Customer" : undefined}
      />
      <EntityGrid
        data={data}
        deleteHandler={hasDeletePermission ? handleDelete : undefined}
        editRoute={hasEditPermission ? "/customers" : undefined}
      />
    </>
  )
}
```

**3. Route Protection** (PermissionGuard):
```typescript
// Prevents direct URL access without permission
import { PermissionGuard } from '@components'

<Route
  path="/regular"
  element={
    <PermissionGuard module="Regular Requests" requiredPermission="view">
      <RegularRequestsList />
    </PermissionGuard>
  }
/>
<Route
  path="/regular/create"
  element={
    <PermissionGuard module="Regular Requests" requiredPermission="edit">
      <CreateRegularRequest />
    </PermissionGuard>
  }
/>
```

**PermissionGuard Component**:
```typescript
// src/components/permission-guard/index.tsx
// Automatically detects module from path or accepts explicit module prop
// Redirects to /dashboard if no permission
// Handles loading states
// Admin users bypass all checks (isAdmin flag)
```

### Admin Users

**Admin Bypass**: Users with `isAdmin: true` (where `user._id === client.adminUserId`) automatically have full access to all modules regardless of role permissions.

```typescript
// In PermissionGuard component
if (isAdmin) {
  return <>{children}</>  // Bypass permission check
}
```

### UserRole Form

**Permission Management UI** (`src/pages/browser-app/users/user-roles/components/create/`):

```typescript
// Displays all 21 modules in a grid with checkboxes
// Select All functionality for view/edit/delete columns
// Auto-dependency: checking edit/delete auto-checks view
// ADMIN role (isSystemRole) cannot be edited or deleted

const UserRoleForm = () => {
  const [userRole, setUserRole] = useState({
    roleName: '',
    permissions: MODULES.map(module => ({
      module,
      view: false,
      edit: false,
      delete: false
    }))
  })
  
  // When checking edit or delete, automatically check view
  const handlePermissionChange = (module, permissionType) => {
    setUserRole(prev => ({
      ...prev,
      permissions: prev.permissions.map(p => {
        if (p.module === module) {
          const updated = { ...p, [permissionType]: !p[permissionType] }
          // Auto-check view when enabling edit/delete
          if ((permissionType === 'edit' || permissionType === 'delete') && updated[permissionType]) {
            updated.view = true
          }
          // Auto-uncheck edit/delete when disabling view
          if (permissionType === 'view' && !updated.view) {
            updated.edit = false
            updated.delete = false
          }
          return updated
        }
        return p
      })
    }))
  }
}
```

---

## User Management Features (Critical)

### UserProfile System

**Combined User + Client Data**:

```typescript
// src/types/index.ts
interface UserProfile {
  // User fields (individual person)
  userId: string
  name: string
  contactNumber: string
  email: string
  designation: string
  role: UserRoleModel
  isAdmin: boolean  // CALCULATED: user._id === client.adminUserId
  
  // Client fields (organization)
  clientId: string
  agencyName: string
  agencyContactNumber: string
  agencyEmail: string
  address: {
    addressLine1: string
    addressLine2?: string
    city: string
    state: string
    pinCode: string
  }
  pointOfContact: {
    name: string
    designation: string
    contactNumber: string
    email: string
  }
  subscriptionStatus: 'active' | 'inactive' | 'suspended' | 'trial'
}
```

**Profile Page Pattern**:

```typescript
// src/pages/browser-app/settings/profile/index.tsx
const Profile = () => {
  const { data: userProfile, isLoading } = useUserProfileQuery()
  const updateMutation = useUpdateUserProfileMutation()
  
  const [formData, setFormData] = useState({
    // User fields - editable by anyone
    name: '',
    contactNumber: '',
    email: '',
    designation: '',
    
    // Client fields - editable ONLY by admin
    agencyName: '',
    agencyContactNumber: '',
    agencyEmail: '',
    address: {},
    pointOfContact: {}
  })
  
  useEffect(() => {
    if (userProfile) setFormData({
      name: userProfile.name,
      contactNumber: userProfile.contactNumber,
      // ... all fields
    })
  }, [userProfile])
  
  const handleSubmit = async () => {
    // Validate
    const { isValid, errorMap } = validatePayload(
      profileValidationSchema(userProfile.isAdmin),  // Conditional validation
      formData
    )
    if (!isValid) {
      setErrors(errorMap)
      return
    }
    
    try {
      await updateMutation.mutateAsync(formData)
      // Success feedback
    } catch (error) {
      setError(error.response?.data?.message)
    }
  }
  
  return (
    <div className={bemClass([blk])}>
      {/* User Section - Always Editable */}
      <TextInput
        label="Name"
        value={formData.name}
        onChange={(value) => handleChange('name', value)}
      />
      
      {/* Client Section - Admin Only */}
      <TextInput
        label="Agency Name"
        value={formData.agencyName}
        onChange={(value) => handleChange('agencyName', value)}
        disabled={!userProfile.isAdmin}  // Non-admin cannot edit
        className={bemClass([blk, 'input', [!userProfile.isAdmin ? 'disabled' : undefined]])}
      />
    </div>
  )
}
```

### User List, User Roles & User Groups

**User Management Pattern**:

The system has three distinct user-related entities:
- **User List** = Individual user accounts (people who log in)
- **User Roles** = Permission definitions (what actions users can perform)
- **User Groups** = Organizational grouping (which team/department users belong to)

**User Management Queries**:

```typescript
// src/api/queries/user.ts
export const useUsersQuery = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await get({ endpoint: '/user-list' })
      return response.data
    }
  })
}

export const useCreateUserMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (userData: UserModel) => {
      const response = await post({ endpoint: '/user-list', data: userData })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })
}
```

**User List Page** (`src/pages/browser-app/users/user-list/`):

```typescript
const UserList = () => {
  const { data, isLoading } = useUsersQuery()
  const deleteMutation = useDeleteUserMutation()
  
  const columns = [
    { key: 'name', title: 'Name' },
    { key: 'email', title: 'Email' },
    { key: 'role.roleName', title: 'Role' },  // Nested field
    { key: 'designation', title: 'Designation' },
    { key: 'isActive', title: 'Status', render: (val) => val ? 'Active' : 'Inactive' }
  ]
  
  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id)
    } catch (error) {
      // Cannot delete admin user - backend protection
      alert(error.response?.data?.message)
    }
  }
  
  return (
    <>
      <PageHeader 
        title="Users"
        total={data?.length}
        btnRoute="/users/user-list/create"
        btnLabel="Add User"
      />
      <EntityGrid
        columns={columns}
        data={data}
        deleteHandler={handleDelete}
        editRoute="/users/user-list"
      />
    </>
  )
}
```

**User Form** (`src/pages/browser-app/users/user-list/components/create/`):

```typescript
const UserForm = () => {
  const params = useParams()
  const navigate = useNavigate()
  const isEditing = !!params.id
  
  const { data: roles } = useUserRolesQuery()
  const { data: userGroups } = useUserGroupsQuery()
  const { data: userData } = useUserByIdQuery(params.id || '')
  const createMutation = useCreateUserMutation()
  const updateMutation = useUpdateUserMutation()
  
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    email: '',
    password: '',  // Only for create mode
    role: '',
    userGroup: null,  // Optional organizational grouping
    designation: '',
    isActive: true
  })
  
  useEffect(() => {
    if (userData) {
      setFormData({
        ...userData,
        password: ''  // Never populate password
      })
    }
  }, [userData])
  
  const handleSubmit = async () => {
    // Validation
    const schema = isEditing 
      ? userUpdateValidationSchema  // No password required
      : userCreateValidationSchema  // Password required
    
    const { isValid, errorMap } = validatePayload(schema, formData)
    if (!isValid) {
      setErrors(errorMap)
      return
    }
    
    try {
      if (isEditing) {
        // Update - password is NOT updated here
        const { password, ...updateData } = formData
        await updateMutation.mutateAsync({ _id: params.id, ...updateData })
      } else {
        // Create - password is set by user
        await createMutation.mutateAsync(formData)
      }
      navigate('/users/user-list')
    } catch (error) {
      setError(error.response?.data?.message)
    }
  }
  
  return (
    <div className={bemClass([blk])}>
      <TextInput label="Name" value={formData.name} onChange={...} />
      <TextInput label="Contact" value={formData.contactNumber} onChange={...} />
      <TextInput label="Email" value={formData.email} onChange={...} />
      
      {/* Password only in create mode */}
      {!isEditing && (
        <TextInput 
          label="Password" 
          type="password"
          value={formData.password} 
          onChange={...} 
        />
      )}
      
      <SelectInput 
        label="Role" 
        value={formData.role}
        options={roles?.map(r => ({ label: r.roleName, value: r._id }))}
        onChange={...}
      />
      
      <SelectInput 
        label="User Group" 
        value={formData.userGroup}
        options={[{ label: 'None', value: null }, ...userGroups?.map(g => ({ label: g.groupName, value: g._id }))]}
        onChange={...}
      />
      
      <TextInput label="Designation" value={formData.designation} onChange={...} />
      
      <CheckBox 
        label="Active" 
        checked={formData.isActive} 
        onChange={...} 
      />
    </div>
  )
}
```

**UserRole Management** (`src/pages/browser-app/users/user-roles/`):

```typescript
// src/types/index.ts
interface UserRoleModel {
  _id: string
  clientId: string
  roleName: string
  permissions: Permission[]
  isSystemRole: boolean  // ADMIN role - cannot edit/delete
  isActive: boolean
}

interface Permission {
  module: 'Dashboard' | 'Requests' | 'Packages' | 'Vehicles' | 'Staff' | 
          'Customers' | 'Expenses' | 'Payments' | 'Reports' | 
          'Advance Bookings' | 'Advance Payments' | 'User Roles' | 
          'Suppliers' | 'Configurations'
  view: boolean
  edit: boolean
  delete: boolean
}

// User Role Form
const UserRoleForm = () => {
  const [formData, setFormData] = useState({
    roleName: '',
    permissions: [
      { module: 'Dashboard', view: true, edit: false, delete: false },
      { module: 'Requests', view: true, edit: true, delete: false },
      // ... all 14 modules
    ]
  })
  
  const handlePermissionChange = (module: string, action: 'view' | 'edit' | 'delete', value: boolean) => {
    setFormData({
      ...formData,
      permissions: formData.permissions.map(p =>
        p.module === module ? { ...p, [action]: value } : p
      )
    })
  }
  
  return (
    <div className={bemClass([blk])}>
      <TextInput label="Role Name" value={formData.roleName} onChange={...} />
      
      <table className={bemClass([blk, 'permissions-table'])}>
        <thead>
          <tr>
            <th>Module</th>
            <th>View</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {formData.permissions.map(perm => (
            <tr key={perm.module}>
              <td>{perm.module}</td>
              <td>
                <CheckBox 
                  checked={perm.view}
                  onChange={(val) => handlePermissionChange(perm.module, 'view', val)}
                />
              </td>
              <td>
                <CheckBox 
                  checked={perm.edit}
                  onChange={(val) => handlePermissionChange(perm.module, 'edit', val)}
                />
              </td>
              <td>
                <CheckBox 
                  checked={perm.delete}
                  onChange={(val) => handlePermissionChange(perm.module, 'delete', val)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

---

## Common Workflows

### Creating List Page

Use `EntityGrid` + `PageHeader`:

```typescript
import { EntityGrid, PageHeader } from '@components'
import { downloadFile } from '@utils'

const CustomerList = () => {
  const { data, isLoading } = useCustomersQuery()
  const deleteMutation = useDeleteCustomerMutation()
  
  const columns = [
    { key: 'name', title: 'Name' },
    { key: 'contact', title: 'Contact' },
    { key: 'email', title: 'Email' }
  ]
  
  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id)
  }
  
  return (
    <>
      <PageHeader 
        title="Customers"
        total={data?.length}
        btnRoute="/customers/create"
        btnLabel="Add Customer"
        exportButtonsToShow={{ excel: true, csv: true, pdf: true }}
        onExportExcel={() => downloadFile('/customer/export/excel', 'customers.xlsx')}
        onExportCSV={() => downloadFile('/customer/export/csv', 'customers.csv')}
        onExportPDF={() => downloadFile('/customer/export/pdf', 'customers.pdf')}
      />
      <EntityGrid 
        columns={columns}
        data={data}
        deleteHandler={handleDelete}
        editRoute="/customers"
      />
    </>
  )
}
```

### Creating Form Page (Create + Edit)

Single component handles both create AND edit modes:

```typescript
const CustomerForm = () => {
  const params = useParams()
  const navigate = useNavigate()
  const isEditing = !!params.id  // Check URL parameter
  
  const [formData, setFormData] = useState(INITIAL_STATE)
  
  // Load data for edit mode
  const { data } = useCustomerByIdQuery(params.id || '')
  useEffect(() => {
    if (data) setFormData(data)
  }, [data])
  
  const createMutation = useCreateCustomerMutation()
  const updateMutation = useUpdateCustomerMutation()
  
  const handleSubmit = async () => {
    // Validate
    const { isValid, errorMap } = validatePayload(validationSchema, formData)
    if (!isValid) {
      setErrors(errorMap)
      return
    }
    
    // Submit
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ _id: params.id, ...formData })
      } else {
        await createMutation.mutateAsync(formData)
      }
      navigate('/customers')
    } catch (error) {
      setError(error.response?.data?.message)
    }
  }
  
  return <div>{/* Form JSX */}</div>
}
```

### Creating Detail Page with Nested Schema

For complex entities with nested schemas (e.g., RegularRequest, MonthlyFixedRequest):

```typescript
// 1. Define transformed data interface matching display format
interface TransformedData extends Record<string, any> {
  packageDetails: { 
    packageCategory: string
    package: { packageCode: string } 
  }
  requestDetails: { 
    requestType: string
    pickUpLocation: string
    pickUpDateTime: string  // Formatted
  }
  customerDetails: {
    customerType: 'existing' | 'new'
    customer: { name: string } | null
    newCustomerDetails: { name: string; contact: string } | null
  }
}

// 2. Transform function to format API response for display
const transformData = (
  data: ApiModel,
  relatedData?: RelatedModel  // Conditionally fetched
): TransformedData => {
  return {
    packageDetails: {
      packageCategory: data.packageDetails.packageCategory || '-',
      package: relatedData?.packageCode || '-'
    },
    requestDetails: {
      requestType: data.requestDetails.requestType || '-',
      pickUpLocation: data.requestDetails.pickUpLocation || '-',
      pickUpDateTime: formatDateValueForDisplay(data.requestDetails.pickUpDateTime)
    },
    customerDetails: {
      customerType: data.customerDetails.customerType || '-',
      customer: relatedData ? { name: relatedData.name } : null,
      newCustomerDetails: data.customerDetails.newCustomerDetails || null
    }
  }
}

// 3. Extract IDs from nested structures for fetching related data
const customerId = currentData?.customerDetails.customer && 
  typeof currentData.customerDetails.customer === 'string'
  ? currentData.customerDetails.customer : ''

// 4. Conditionally fetch related data
const shouldFetchCustomer = 
  currentData?.customerDetails.customerType === 'existing' && !!customerId
const { data: customerData, isLoading: isCustomerLoading } = useCustomerByIdQuery(
  shouldFetchCustomer ? customerId : ''
)

// 5. Filter panel fields based on entity types
const createFilteredTemplate = (template: Panel[], data: ApiModel): Panel[] => {
  return template.map(panel => {
    if (panel.panel === 'Customer Details') {
      return {
        ...panel,
        fields: panel.fields.filter(field => {
          // Show customer fields only for existing
          if (field.path === 'customerDetails.customer.name' && 
              data.customerDetails.customerType === 'new') {
            return false
          }
          // Show newCustomerDetails only for new
          if (field.path.startsWith('customerDetails.newCustomerDetails.') && 
              data.customerDetails.customerType === 'existing') {
            return false
          }
          return true
        })
      }
    }
    return panel
  })
}

// 6. Render with PageDetail component
const filteredTemplate = useMemo(() => 
  createFilteredTemplate(detailTemplate, currentData),
  [currentData]
)

return (
  <PageDetail
    template={filteredTemplate}
    data={transformedData}
  />
)
```

**Key Patterns for Nested Schema Detail Pages**:
- Extract IDs from nested structures for related data fetching
- Conditionally fetch only needed related entities
- Transform nested API data to flat display format
- Filter panel fields based on entity types (existing vs new vs regular)
- Handle both populated objects and string IDs
- Use `formatDateValueForDisplay` for date fields (accepts Date | string | null | undefined)

### Creating Forms with Nested Schema (Regular/Existing/New Pattern)

**Critical Pattern**: For entities with regular/existing/new type selection (e.g., MonthlyFixedRequest):

```typescript
// 1. Type Selection Validation - Conditional Requirements
const validationSchema = (data: FormData) => {
  const conditionalFields = []
  
  // Regular type - Uses assignmentDetails (no validation needed for vehicleDetails)
  // Existing type - Must select vehicle/staff from dropdown (requires vehicleCategory + vehicle)
  // New type - Must enter all new vehicle/staff details
  
  if (data.vehicleDetails.vehicleType === 'existing') {
    conditionalFields.push(emptyField('vehicleDetails.vehicleCategory'))
    
    // If supplier category, additional requirements
    if (nameToPath(data.vehicleDetails.vehicleCategory) === 'supplier') {
      conditionalFields.push(emptyField('vehicleDetails.supplierDetails.supplier'))
      conditionalFields.push(emptyField('vehicleDetails.supplierDetails.package'))
    }
    
    conditionalFields.push(emptyField('vehicleDetails.vehicle'))
  } else if (data.vehicleDetails.vehicleType === 'new') {
    conditionalFields.push(emptyField('vehicleDetails.newVehicleDetails.vehicleName'))
    // ... other new vehicle fields
  }
  // Note: No validation for 'regular' type - uses assignmentDetails from customer
  
  return conditionalFields
}

// 2. Supplier Filtering - Vehicle/Package Selection
// When vehicleCategory is 'supplier', must show supplier dropdown first
const isSupplierVehicle = useMemo(() => 
  nameToPath(monthlyFixedRequest.vehicleDetails.vehicleCategory) === 'supplier',
  [monthlyFixedRequest.vehicleDetails.vehicleCategory]
)

// Filter vehicles by selected supplier
useEffect(() => {
  if (isSupplierVehicle && selectedSupplier && supplierVehicles.data) {
    const filtered = supplierVehicles.data.filter(
      vehicle => vehicle.supplier?._id === selectedSupplier
    )
    setVehicleOptions(filtered)
  }
}, [isSupplierVehicle, selectedSupplier, supplierVehicles.data])

// Filter packages by selected supplier
useEffect(() => {
  if (isSupplierVehicle && selectedSupplier && supplierPackages.data) {
    const filtered = supplierPackages.data.filter(
      pkg => pkg.supplier === selectedSupplier
    )
    setPackageOptions(filtered)
  }
}, [isSupplierVehicle, selectedSupplier, supplierPackages.data])

// 3. Conditional UI Rendering
{monthlyFixedRequest.vehicleDetails.vehicleType === 'regular' && (
  // Regular type: Show info message, no selection needed
  <Alert type="info" message="Uses assigned vehicle from customer's monthly fixed setup" />
)}

{monthlyFixedRequest.vehicleDetails.vehicleType === 'existing' && (
  <>
    <SelectInput label="Vehicle Category" /* ... */ />
    
    {isSupplierVehicle && (
      <SelectInput label="Supplier" /* Shown first for supplier category */ />
    )}
    
    <SelectInput 
      label="Vehicle" 
      options={vehicleOptions}  // Filtered by supplier if applicable
      disabled={isSupplierVehicle && !selectedSupplier}  // Disabled until supplier selected
    />
    
    {isSupplierVehicle && (
      <SelectInput label="Supplier Package" options={packageOptions} />
    )}
  </>
)}

{monthlyFixedRequest.vehicleDetails.vehicleType === 'new' && (
  <>
    <TextInput label="Vehicle Name" /* ... */ />
    <TextInput label="Registration Number" /* ... */ />
    // ... other new vehicle fields
  </>
)}
```

**Key Design Principles**:
- **Regular Type**: Uses `assignmentDetails` from customer's monthly fixed setup
  - Frontend: No vehicle selection shown, validated via customer selection
- **Existing Type**: Uses `vehicleDetails` for additional/different vehicle
  - Frontend: Shows vehicle category + vehicle selection
- **New Type**: Uses `newVehicleDetails` for temporary vehicle
  - Frontend: Shows all new vehicle detail fields
- **Supplier Flow**: When category is 'supplier', show supplier → vehicle → package
  - Vehicle dropdown filtered by selected supplier
  - Package dropdown filtered by selected supplier

---

## Dashboard & Data Visualization Patterns

### Recharts Component Pattern

Use Recharts for professional charts with component-level loading states:

```typescript
import React, { FunctionComponent } from 'react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts'
import { bemClass, formatNumber } from '@utils'

const blk = 'monthly-chart'

interface ChartProps {
  data?: any[]
  isLoading?: boolean
  error?: any
  title: string
  year: number
  onYearChange: (year: number) => void
}

const MonthlyChart: FunctionComponent<ChartProps> = ({
  data,
  isLoading,
  error,
  title,
  year,
  onYearChange
}) => {
  // Internal loading/error handling
  if (isLoading) return <div className={bemClass([blk, 'loader'])} />
  if (error) return <div className={bemClass([blk, 'error'])}>Failed to load</div>
  if (!data || data.length === 0) return <div>No data</div>
  
  return (
    <div className={bemClass([blk])}>
      <div className={bemClass([blk, 'header'])}>
        <h3>{title}</h3>
        <SelectInput
          value={year}
          options={yearOptions}
          onChange={onYearChange}
        />
      </div>
      
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value) => formatNumber(value)} />
          <Legend />
          <Bar dataKey="value" fill="#2196F3" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default MonthlyChart
```

### Component-Level Loading States

**Always render components, pass loading/error props** instead of conditional rendering:

```typescript
// ✅ Correct - Component-level loading
const Dashboard = () => {
  const { data, isLoading, error } = useMonthlyTripsQuery(year, type)
  
  return (
    <MonthlyChart
      data={data?.data}  // Optional chaining
      isLoading={isLoading}
      error={error}
      title="Monthly Trips"
      year={year}
      onYearChange={setYear}
    />
  )
}

// ❌ Wrong - Section-level loading (causes entire section reload)
const Dashboard = () => {
  const { data, isLoading } = useMonthlyTripsQuery(year, type)
  
  return (
    <>
      {isLoading ? (
        <Loader />  // Entire section reloads
      ) : (
        <MonthlyChart data={data} />
      )}
    </>
  )
}
```

**Benefits**: Only specific chart reloads when year changes, no layout shift, better UX.

### Data Transformation for Recharts

Transform backend data format to Recharts format:

```typescript
// Backend format: { month: 11, regular: 1, fixed: 0 }
// Recharts format: { month: 'Nov', 'Regular Requests': 1, 'Monthly Fixed': 0 }

const MONTH_ABBREVIATIONS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                             'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const transformedData = useMemo(() => {
  if (!data) return []
  
  return data.map(item => ({
    month: MONTH_ABBREVIATIONS[item.month - 1],
    'Regular Requests': item.regular,
    'Monthly Fixed': item.fixed
  }))
}, [data])
```

### Modular React Query Hooks

For dashboards with independent sections, use separate hooks:

```typescript
// src/api/queries/dashboard.ts
import { generateAPIMethods } from '@api'
import { useQuery } from '@tanstack/react-query'

const { get } = generateAPIMethods('/dashboard')

export const useGrowthMetricsQuery = (period: 'week' | 'month') => {
  return useQuery({
    queryKey: ['dashboard', 'growth-metrics', period],
    queryFn: async () => {
      const response = await get({ endpoint: '/growth-metrics', params: { period } })
      return response.data
    },
    staleTime: 2 * 60 * 1000  // 2 minutes
  })
}

export const useMonthlyTripsQuery = (year: number, type: string) => {
  return useQuery({
    queryKey: ['dashboard', 'monthly-trips', year, type],
    queryFn: async () => {
      const response = await get({ endpoint: '/monthly-trips', params: { year, type } })
      return response.data
    },
    staleTime: 10 * 60 * 1000  // 10 minutes
  })
}
```

**Benefits**: Independent caching per section, granular refetch control, optimized stale times.

---

## Navigation Structure

### Application Routes

```typescript
// src/config/navigation.ts
export const navigation = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'dashboard'
  },
  {
    label: 'Requests',
    path: '/requests',
    icon: 'requests',
    subRoutes: [
      { label: 'Regular Requests', path: '/requests/regular' },
      { label: 'Monthly Fixed', path: '/requests/monthly-fixed' }
    ]
  },
  {
    label: 'Customers',
    path: '/customers',
    icon: 'customers',
    configurable: true  // Uses dynamic categories
  },
  {
    label: 'Vehicles',
    path: '/vehicles',
    icon: 'vehicles',
    configurable: true
  },
  {
    label: 'Staff',
    path: '/staff',
    icon: 'staff',
    configurable: true
  },
  {
    label: 'Users',
    path: '/users',
    icon: 'users',
    subRoutes: [
      { label: 'User List', path: '/users/user-list' },
      { label: 'User Roles', path: '/users/user-roles' },
      { label: 'User Groups', path: '/users/user-groups' }
    ]
  },
  {
    label: 'Settings',  // NEW
    path: '/settings',
    icon: 'settings',
    subRoutes: [
      { label: 'Configurations', path: '/settings/configurations' },
      { label: 'Profile', path: '/settings/profile' }
    ]
  }
  // ... other modules
]
```

**Configurable Routes**: Categories fetched from backend, routes generated dynamically:
```typescript
// For configurable entities (customers, vehicles, staff)
const categories = await fetchCustomerCategories()
// Routes: /customers/regular-customer, /customers/corporate, etc.
```

---

## Critical Don'ts

❌ **Never** use raw axios in components (use React Query)
❌ **Never** write CSS class strings manually (use `bemClass`)
❌ **Never** forget to convert category names with `nameToPath`/`pathToName`
❌ **Never** skip validation before form submission
❌ **Never** use `any` type in TypeScript (use `Record<string, any>` if needed)
❌ **Never** skip SCSS import (`@import '~/src/sass/style'`)
❌ **Never** use conditional rendering for charts (pass isLoading/error props instead)
❌ **Never** build custom charts with HTML/CSS (use Recharts library)
❌ **Never** hardcode URLs (use environment variables)
❌ **Never** populate password fields (security risk)
❌ **Never** forget disabled field styling (both `disabled` prop + CSS class)
❌ **Never** assume user is admin (always check `isAdmin` flag)
❌ **Never** allow editing of admin-only fields without permission check

---

## Key Files & References

**Comprehensive Documentation**: `Prompts/` folder contains detailed guides
- `00-MASTER-PROMPT.md` - Overview and principles
- `01-FRONTEND-ARCHITECTURE.md` - Component structure and routing
- `08-IMPLEMENTATION-GUIDE.md` - Step-by-step new entity guide
- `09-QUICK-REFERENCE.md` - Code snippets and templates

**Pattern Examples**:
- **User Management**: `src/pages/browser-app/users/user-list/`, `src/pages/browser-app/users/user-roles/`
- **Profile Settings**: `src/pages/browser-app/settings/profile/`
- **Entity CRUD**: `src/pages/browser-app/customers/category/components/`
- **Nested Schema**: `src/pages/browser-app/requests/monthly-fixed/components/create/`
- **Dashboard**: `src/pages/browser-app/dashboard/`
- **Base Components**: `src/base/button/`, `src/base/text-input/`
- **Common Components**: `src/components/entity-grid/`, `src/components/page-header/`

**API Queries**:
- `src/api/queries/user.ts` - User management hooks
- `src/api/queries/userRole.ts` - UserRole hooks
- `src/api/queries/customer.ts` - Entity CRUD hooks
- `src/api/queries/dashboard.ts` - Dashboard data hooks

**Utilities**:
- `src/utils/index.ts` - bemClass, validatePayload, nameToPath, downloadFile, formatNumber
- `src/api/index.ts` - generateAPIMethods for CRUD operations

**Type Definitions**:
- `src/types/index.ts` - UserProfile, UserModel, UserRoleModel, Permission interfaces

**Configuration**:
- `src/config/navigation.ts` - Application navigation structure

---

## Development Commands

```bash
# Development server
npm run dev        # Starts on localhost:4040

# Production build
npm run build      # Webpack production build

# Type checking
npm run type-check # TypeScript validation

# Linting
npm run lint       # ESLint check
```

---

## Common Pitfalls & Solutions

**Import errors**: Verify webpack aliases configured (`@base`, `@components`, `@api`, etc.)

**SCSS errors**: Always import `~/src/sass/style` at top of SCSS files

**Auth errors**: Check if JWT cookie is set and valid (8-hour expiration)

**Data not showing**: Check React Query cache - use `queryClient.invalidateQueries()` after mutations

**Category issues**: Remember to use `nameToPath()` before saving, `pathToName()` for display

**Permission issues**: Check user's role permissions and `isAdmin` flag

**Profile update fails**: Verify only admin users can update client fields

**User deletion fails**: Admin user cannot be deleted (backend protection)

**Disabled fields editable**: Apply both `disabled` prop AND CSS class

**Chart not updating**: Use component-level loading states, not conditional rendering

---

## When In Doubt

1. Check similar existing implementation (customers, vehicles, staff, users)
2. Review relevant doc in `Prompts/` folder
3. Use code templates from `09-QUICK-REFERENCE.md`
4. Follow existing patterns - consistency over innovation
5. Check type definitions in `src/types/index.ts`
6. Verify API response structure in browser dev tools

---

**Last Updated**: December 2024  
**Version**: 3.0 - Multi-Organization Frontend Architecture

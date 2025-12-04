# Travel Agency Management System - AI Developer Guide

This monorepo contains a **multi-tenant Travel Agency Management System** with React TypeScript frontend and Express MongoDB backend. All data is scoped to `consumerId` (logged-in user).

## Essential Architecture Patterns

### Multi-Tenancy (Critical)
**Every database query MUST filter by `consumerId`**:
```javascript
// Backend: Always include consumerId
const data = await Customer.find({ 
  consumerId: userId,  // From req.body.userId set by auth middleware
  ...otherFilters 
})
```

### Path/Name Conversion (Used Everywhere)
Category names convert between display and URL formats:
```typescript
nameToPath('Regular Customer') → 'regular-customer'  // For URLs, DB
pathToName('regular-customer') → 'Regular Customer'  // For display
```

### BEM Class Generation
Use `bemClass` utility, never write class strings manually:
```typescript
const blk = 'customer-form'
className={bemClass([blk])}                     // 'customer-form'
className={bemClass([blk, 'header'])}           // 'customer-form__header'
className={bemClass([blk, ['editing']])}        // 'customer-form customer-form--editing'
className={bemClass([blk, 'input', ['error']])} // 'customer-form__input customer-form__input--error'
```

## Frontend Essentials

### Environment Variables (CRITICAL)
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

### Required Import Pattern
```typescript
// ALWAYS use webpack aliases
import { Button, TextInput } from '@base'        // NOT '../../../base/button'
import { EntityGrid } from '@components'
import { bemClass, validatePayload } from '@utils'
import { useCustomersQuery } from '@api/queries/customer'

// For charts (Recharts library)
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts'
```

### React Query is Mandatory for API
Never use axios directly in components:
```typescript
// ✅ Correct
const { data, isLoading } = useCustomersQuery()
const createMutation = useCreateCustomerMutation()

// ❌ Wrong - Don't do this
axios.get('/api/customer')
```

### Standard Component Structure
```typescript
// 1. Imports
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { bemClass } from '@utils'

// 2. Constants outside component
const blk = 'customer-form'
const INITIAL_STATE = { name: '', contact: '' }

// 3. Component
const CustomerForm = ({ category }) => {
  // a. Route hooks first
  const navigate = useNavigate()
  
  // b. State hooks
  const [formData, setFormData] = useState(INITIAL_STATE)
  
  // c. Query/mutation hooks
  const createMutation = useCreateCustomerMutation()
  
  // d. Effects
  useEffect(() => { /* ... */ }, [])
  
  // e. Memoized callbacks
  const handleSubmit = useCallback(() => { /* ... */ }, [formData])
  
  return <div className={bemClass([blk])}>{/* JSX */}</div>
}

export default CustomerForm
```

### Form Validation Pattern
```typescript
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
```

### SCSS Requirements
Every component SCSS file must:
```scss
@import '~/src/sass/style';  // REQUIRED - imports variables, mixins

.customer-form {  // BEM block
  &__header {     // BEM element
    color: $text-primary;  // Use variables
  }
  
  &--editing {    // BEM modifier
    background: $bg-secondary;
  }
}
```

## Backend Essentials

### Standard Controller Pattern
```javascript
const getItems = async (req, res, next) => {
  const { body: { userId }, query: { filterData } } = req
  
  try {
    const data = await Model.find({
      consumerId: userId,  // REQUIRED - multi-tenancy
      ...(filterData || {})
    }).sort({ createdAt: -1 }).lean()
    
    res.status(200).send({ total: data.length, data })
  } catch (error) {
    next(error)
  }
}
```

### Authentication Flow
- JWT stored in HTTP-only cookie (`session-token`)
- Middleware `authenticateToken` adds `userId` to `req.body`
- Frontend stores boolean flag in sessionStorage
- All routes except `/user` require authentication

### Model Schema Pattern
```javascript
const schema = Schema({
  _id: Schema.Types.ObjectId,
  consumerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  isActive: { type: Boolean, default: true },  // Soft delete
  // ... entity fields
  createdAt: { type: Date, default: Date.now }
})
```

## Common Workflows

### Adding New Entity (Quick Reference)
1. **Backend**: Model → Controller → Routes → Register in `index.js`
2. **Frontend**: Types → API queries → Pages (list/create/detail) → Routes
3. **Export**: Add Excel/CSV/PDF endpoints to controller
4. **Navigation**: Add to `config/navigation.ts`

See comprehensive example in `Prompts/08-IMPLEMENTATION-GUIDE.md`

### Creating List Page
Use `EntityGrid` + `PageHeader`:
```typescript
<PageHeader 
  title="Customers" 
  total={data.length}
  btnRoute="/customers/create"
  btnLabel="Add Customer"
  exportButtonsToShow={{ excel: true, csv: true, pdf: true }}
  onExportExcel={() => downloadFile('/customer/export/excel', 'customers.xlsx')}
/>
<EntityGrid 
  columns={columns}
  data={customers}
  deleteHandler={handleDelete}
  editRoute="/customers"
/>
```

### Creating Form Page
Single component handles create AND edit:
```typescript
const params = useParams()
const isEditing = !!params.id  // Check URL parameter

// Load data for edit mode
const { data } = useCustomerByIdQuery(params.id || '')
useEffect(() => {
  if (data) setFormData(data)
}, [data])

// Submit logic
if (isEditing) {
  await updateMutation.mutateAsync({ _id: params.id, ...formData })
} else {
  await createMutation.mutateAsync(formData)
}
```

### Creating Detail Page with Nested Schema
For complex entities with nested schemas (e.g., RegularRequest, MonthlyFixedRequest):

```typescript
// 1. Define transformed data interface matching display format
interface TransformedData extends Record<string, any> {
  packageDetails: { packageCategory: string; package: { packageCode: string } }
  requestDetails: { requestType: string; pickUpLocation: string; /* ... */ }
  customerDetails: {
    customerType: string
    customer: { name: string } | null
    newCustomerDetails: { name: string; contact: string } | null
  }
  // ... other nested groups
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
const shouldFetchCustomer = currentData?.customerDetails.customerType === 'existing' && !!customerId
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
  - Backend: `assignmentDetails.vehicle` used for tracking
  - Frontend: No vehicle selection shown, validated via customer selection
  - Schema: `vehicleDetails.vehicle` can be null
- **Existing Type**: Uses `vehicleDetails` for additional/different vehicle
  - Backend: `vehicleDetails.vehicle` used, may trigger supplier payment if supplier category
  - Frontend: Shows vehicle category + vehicle selection
  - Schema: `vehicleDetails.vehicle` required
- **New Type**: Uses `newVehicleDetails` for temporary vehicle
  - Backend: New vehicle details stored, no tracking in vehicle reports
  - Frontend: Shows all new vehicle detail fields
  - Schema: All `newVehicleDetails` fields required
- **Supplier Flow**: When category is 'supplier', show supplier → vehicle → package
  - Vehicle dropdown filtered by selected supplier
  - Package dropdown filtered by selected supplier
  - Backend creates supplier payment record when supplier vehicle used

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
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
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

const transformedData = data.map(item => ({
  month: MONTH_ABBREVIATIONS[item.month - 1],
  'Regular Requests': item.regular,
  'Monthly Fixed': item.fixed
}))
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

## Critical Don'ts

❌ **Never** query database without `consumerId` filter
❌ **Never** use raw axios in components (use React Query)
❌ **Never** write CSS class strings manually (use `bemClass`)
❌ **Never** forget to convert category names with `nameToPath`/`pathToName`
❌ **Never** skip validation before form submission
❌ **Never** use `any` type in TypeScript (use `Record<string, any>` if needed)
❌ **Never** hard delete (use `isActive: false` for soft delete)
❌ **Never** use conditional rendering for charts (pass isLoading/error props instead)
❌ **Never** build custom charts with HTML/CSS (use Recharts library)

## Key Files & References

**Comprehensive Documentation**: `Prompts/` folder contains 10 detailed guides
- `00-MASTER-PROMPT.md` - Overview and principles
- `08-IMPLEMENTATION-GUIDE.md` - Step-by-step new entity guide
- `09-QUICK-REFERENCE.md` - Code snippets and templates

**Pattern Examples**:
- Backend: `src/controllers/customer.js`, `src/models/customer.js`
- **Backend Nested Schema**: `src/models/fixedRequest.js` (regular/existing/new pattern with conditional validation)
- Frontend: `src/pages/browser-app/customers/category/components/`
- **Frontend Nested Schema**: `src/pages/browser-app/requests/monthly-fixed/components/create/` (complete regular/existing/new implementation)
- API Queries: `src/api/queries/customer.ts`
- Base Components: `src/base/button/index.tsx`
- **Dashboard**: `src/pages/browser-app/dashboard/` (modular data fetching, Recharts)
- **Charts**: `src/components/monthly-chart/` (Recharts integration, component-level loading)

**Utilities**:
- `src/utils/index.ts` - bemClass, validatePayload, nameToPath, downloadFile, formatNumber
- `src/api/index.ts` - generateAPIMethods for CRUD operations
- `src/api/queries/dashboard.ts` - Modular dashboard hooks with optimized caching
- `src/middlewares/cookieAuth.js` - JWT authentication

**Reference Documents**:
- `Prompts/MONTHLY-FIXED-REQUEST-AUDIT.md` - Complete audit of nested schema implementation with regular/existing/new pattern

## Development Commands

```bash
# Frontend (travel-agency-admin-ui)
npm run dev        # Dev server on localhost:4040
npm run build      # Production build
npm run type-check # TypeScript validation

# Backend (travel-agency-api)
npm run dev        # Nodemon on localhost:3000
npm start          # Production server
```

## Common Pitfalls & Solutions

**Import errors**: Verify webpack aliases configured (`@base`, `@components`, `@api`, etc.)

**SCSS errors**: Always import `~/src/sass/style` at top of SCSS files

**Auth errors**: Backend requires `authenticateToken` middleware on all routes except `/user`

**Data not showing**: Check React Query cache - use `queryClient.invalidateQueries()` after mutations

**Category issues**: Remember to use `nameToPath()` before saving, `pathToName()` for display

## When In Doubt

1. Check similar existing implementation (customer, vehicle, staff)
2. Review relevant doc in `Prompts/` folder
3. Use code templates from `09-QUICK-REFERENCE.md`
4. Follow existing patterns - consistency over innovation

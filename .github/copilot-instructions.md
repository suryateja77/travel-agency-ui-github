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
- Frontend: `src/pages/browser-app/customers/category/components/`
- API Queries: `src/api/queries/customer.ts`
- Base Components: `src/base/button/index.tsx`
- **Dashboard**: `src/pages/browser-app/dashboard/` (modular data fetching, Recharts)
- **Charts**: `src/components/monthly-chart/` (Recharts integration, component-level loading)

**Utilities**:
- `src/utils/index.ts` - bemClass, validatePayload, nameToPath, downloadFile, formatNumber
- `src/api/index.ts` - generateAPIMethods for CRUD operations
- `src/api/queries/dashboard.ts` - Modular dashboard hooks with optimized caching
- `src/middlewares/cookieAuth.js` - JWT authentication

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

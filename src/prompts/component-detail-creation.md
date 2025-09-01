# Component Detail Page Creation Guide

## ⚠️ CRITICAL REQUIREMENTS

### 1. EXACT Panel Structure Preservation
**The panel titles and fields in the detail component MUST exactly match how they are rendered in the create/edit form for that specific component.** Each component has unique panel structures and field arrangements that must be preserved.

### 2. Nested Object Path Handling
**Use nested object paths (e.g., `customer.name`, `package.packageCode`) in the model fields instead of flattening to custom field names.** The PageDetail component automatically handles nested path resolution when object structure is preserved.

### 3. Conditional Panel Removal
**Use `.filter()` instead of `.map()` to completely remove conditional panels when they shouldn't be displayed.** This prevents empty panels from showing up in the UI.

## Overview
This guide provides a comprehensive approach for creating detail pages following the established patterns from AdvanceBookingDetail, StaffDetail, and VehicleDetail components.

## Prerequisites
Before creating a detail component, ensure you have:
- ✅ Create/Edit component already implemented
- ✅ API queries for fetching data by ID
- ✅ Type definitions for the model
- ✅ INITIAL_[MODEL] constant in types file
- ✅ Routing structure set up

## Analysis Requirements

### 1. Understand the Source Components
Analyze the existing create/edit component to understand:

#### **Data Model & Types**
- What is the main model interface (e.g., `AdvanceBookingModel`, `StaffModel`, `VehicleModel`)
- What fields contain objects vs primitive values
- Which fields are conditionally rendered based on other field values
- What API responses look like (objects with _id vs string IDs)
- **CRITICAL**: How nested objects are structured (e.g., customer as object vs string)

#### **📋 EXACT Panel Structure Mapping**
- **Panel titles**: Copy EXACTLY from create/edit component
- **Field grouping**: Maintain the SAME panel organization
- **Field order**: Preserve the EXACT order within each panel
- **Conditional panels**: Include panels that show conditionally
- **Panel hierarchy**: Note if panels are grouped under conditional sections

#### **Form Fields Analysis**
- **TextInput fields**: Simple string/number inputs
- **SelectInput fields**: Fields with predefined options
- **ConfiguredInput fields**: Dynamic inputs with configuration
- **RadioGroup fields**: Boolean or enum selections
- **API-dependent fields**: Fields that fetch options from API calls and return objects
- **Object reference fields**: Fields that reference other entities (customer, staff, package)

#### **Conditional Logic Patterns**
- Fields that show/hide based on other field values
- Entire panels that show/hide based on boolean flags
- API calls that depend on form state
- Validation rules that change based on conditions

### 2. State Management Patterns
- How the form state is initialized
- What the reducer pattern looks like
- How field changes are handled
- How API data is transformed
- **NEW**: How object references are handled in API responses

## Implementation Steps

### Step 1: Analyze Create/Edit Component Structure
**CRITICAL**: Before writing any code, document the EXACT panel structure:

1. **Open the create/edit component** and identify all panels
2. **List panel titles** in the exact order they appear
3. **For each panel**, list all fields in their exact order
4. **Note conditional panels** and their trigger conditions
5. **Document field types** (TextInput, SelectInput, ConfiguredInput, etc.)
6. **🆕 Identify object reference fields** and their expected API response structure

**Example Analysis for Vehicle (Complex Conditional):**
```
Panel 1: "Vehicle Details"
  - Vehicle Type (ConfiguredInput)
  - Manufacturer (TextInput)
  - Vehicle Name (TextInput)
  - Number of Seats (TextInput type="number")
  - Registration Number (TextInput)
  - Is AC Required (RadioGroup boolean)
  - Is Monthly Fixed (RadioGroup boolean)

Panel 2: "Monthly Fixed Customer Details" (conditional: shows when isMonthlyFixed = true)
  - Customer category (SelectInput)
  - Customer (SelectInput with object response: {_id, name})

Panel 3: "Monthly Fixed Package Details" (conditional: shows when isMonthlyFixed = true)
  - Package Category (SelectInput)
  - Package (SelectInput with object response: {_id, packageCode})

Panel 4: "Monthly Fixed Staff Details" (conditional: shows when isMonthlyFixed = true)
  - Staff Category (SelectInput)
  - Staff (SelectInput with object response: {_id, name})

Panel 5: "Monthly Fixed Contract Details" (conditional: shows when isMonthlyFixed = true)
  - Contract Start Date (TextInput type="date")
  - Contract End Date (TextInput type="date")

Panel 6: "Comments"
  - Comments (TextArea)

Panel 7: "Is active"
  - Is Active (RadioGroup boolean)
```

### Step 2: Create Detail Model
Create `src/pages/browser-app/[component]/components/detail/model/index.ts`:

```typescript
import { Panel } from "@types";

export const [component]DetailsFields: Panel[] = [
  // EXACT COPY of panel structure from create/edit component
  {
    panel: 'EXACT Panel Title 1', // Copy EXACT title from create component
    fields: [
      // EXACT field order from create component
      {
        label: 'EXACT Field Label 1',
        path: 'exactFieldPath1',
      },
      {
        label: 'EXACT Field Label 2',
        path: 'exactFieldPath2',
      },
      // ... all fields in EXACT order
    ],
  },
  {
    panel: 'EXACT Panel Title 2', // Copy EXACT title from create component
    fields: [
      // ... all fields in EXACT order
    ],
  },
  // 🆕 CRITICAL: For object reference fields, use nested paths
  {
    panel: 'Object Reference Panel',
    fields: [
      {
        label: 'Customer',
        path: 'monthlyFixedDetails.customer.name', // ✅ CORRECT: Nested path
      },
      {
        label: 'Package',
        path: 'monthlyFixedDetails.package.packageCode', // ✅ CORRECT: Nested path
      },
      {
        label: 'Staff',
        path: 'monthlyFixedDetails.staff.name', // ✅ CORRECT: Nested path
      },
    ],
  },
  // Include ALL panels, even conditional ones
];
```

### Step 3: Create Detail Component
Create `src/pages/browser-app/[component]/components/detail/index.tsx`:

```typescript
import { FunctionComponent, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { bemClass, formatBooleanValueForDisplay, formatDateValueForDisplay } from '@utils'

import './style.scss'
import { Text, Alert } from '@base'
import Loader from '@components/loader'
import { [component]DetailsFields } from './model'
import { [Model]Model, INITIAL_[MODEL], Panel, Field } from '@types'
import PageDetail from '@base/page-detail'
import { use[Model]ByIdQuery } from '@api/queries/[component]'

const blk = '[component]-detail'

interface [Model]DetailProps {}

interface Transformed[Model]Data extends Record<string, any> {
  // Define all expected fields with proper types
  // 🆕 CRITICAL: Include nested object structures for reference fields
  [key: string]: any
}

// 🆕 CRITICAL: Transform data while preserving object structure for nested path access
const transform[Model]Data = (data: [Model]Model): Transformed[Model]Data => {
  return {
    ...data,
    // Transform primitive fields with formatting
    hasAc: formatBooleanValueForDisplay(data.hasAc),
    isActive: formatBooleanValueForDisplay(data.isActive),
    // 🆕 CRITICAL: Preserve nested object structure instead of flattening
    monthlyFixedDetails: data.monthlyFixedDetails ? {
      ...data.monthlyFixedDetails,
      // Transform object references to ensure consistent structure
      customer: (() => {
        const customer = data.monthlyFixedDetails.customer
        if (!customer) return '-'
        // If it's already an object, return it as is for nested path access
        if (typeof customer === 'object' && 'name' in customer) {
          return customer
        }
        // If it's a string, create an object structure for consistency
        return { name: customer.toString() }
      })(),
      package: (() => {
        const pkg = data.monthlyFixedDetails.package
        if (!pkg) return '-'
        if (typeof pkg === 'object' && 'packageCode' in pkg) {
          return pkg
        }
        return { packageCode: pkg.toString() }
      })(),
      staff: (() => {
        const staff = data.monthlyFixedDetails.staff
        if (!staff) return '-'
        if (typeof staff === 'object' && 'name' in staff) {
          return staff
        }
        return { name: staff.toString() }
      })(),
      // Format date fields
      contractStartDate: formatDateValueForDisplay(data.monthlyFixedDetails.contractStartDate || null),
      contractEndDate: formatDateValueForDisplay(data.monthlyFixedDetails.contractEndDate || null),
    } : null,
    // Handle other field transformations...
  }
}

// 🆕 CRITICAL: Use .filter() for conditional panels, not .map() with empty fields
const createFilteredTemplate = (originalTemplate: Panel[], data: [Model]Model): Panel[] => {
  return originalTemplate.filter(panel => {
    // ✅ CORRECT: Completely remove conditional panels when condition is false
    if (panel.panel.includes('Monthly Fixed')) {
      return data.isMonthlyFixed
    }
    // For other conditional logic, you can also filter individual fields:
    // return originalTemplate.map(panel => ({
    //   ...panel,
    //   fields: panel.fields.filter(field => shouldShowField(field, data))
    // }))
    return true
  })
}

const [Model]Detail: FunctionComponent<[Model]DetailProps> = () => {
  const params = useParams()

  const { data: current[Model]Data, isLoading, error } = use[Model]ByIdQuery(params.id || '')
  const [[model]Data, set[Model]Data] = useState<Transformed[Model]Data | null>(null)

  // Memoize the filtered template based on conditional logic
  const filteredTemplate = useMemo(() => {
    if (!current[Model]Data) {
      return [component]DetailsFields
    }
    return createFilteredTemplate([component]DetailsFields, current[Model]Data)
  }, [current[Model]Data])

  useEffect(() => {
    if (current[Model]Data) {
      const transformedData = transform[Model]Data(current[Model]Data)
      set[Model]Data(transformedData)
    }
  }, [current[Model]Data])

  return (
    <div className={bemClass([blk])}>
      <div className={bemClass([blk, 'header'])}>
        <Text color="gray-darker" typography="l">
          [Model] Details
        </Text>
      </div>
      <div className={bemClass([blk, 'content'])}>
        {isLoading ? (
          <Loader type="form" />
        ) : error ? (
          <Alert
            type="error"
            message={`Unable to get the ${[model]} details, please try later`}
          />
        ) : (
          <PageDetail
            pageData={[model]Data || INITIAL_[MODEL]}
            pageDataTemplate={filteredTemplate}
          />
        )}
      </div>
    </div>
  )
}

export default [Model]Detail
```

### Step 4: Create Detail Model with Nested Object Paths
Create `src/pages/browser-app/[component]/components/detail/model/index.ts`:

```typescript
import { Panel } from "@types";

export const [component]DetailsFields: Panel[] = [
  // EXACT COPY of panel structure from create/edit component
  {
    panel: 'EXACT Panel Title 1', // Copy EXACT title from create component
    fields: [
      // EXACT field order from create component
      {
        label: 'EXACT Field Label 1',
        path: 'exactFieldPath1',
      },
      {
        label: 'EXACT Field Label 2',
        path: 'exactFieldPath2',
      },
      // ... all fields in EXACT order
    ],
  },
  {
    panel: 'EXACT Panel Title 2', // Copy EXACT title from create component
    fields: [
      // ... all fields in EXACT order
    ],
  },
  // 🆕 CRITICAL: For object reference fields, use nested paths
  {
    panel: 'Object Reference Panel',
    fields: [
      {
        label: 'Customer',
        path: 'monthlyFixedDetails.customer.name', // ✅ CORRECT: Nested path for object access
      },
      {
        label: 'Package',
        path: 'monthlyFixedDetails.package.packageCode', // ✅ CORRECT: Nested path for object access
      },
      {
        label: 'Staff',
        path: 'monthlyFixedDetails.staff.name', // ✅ CORRECT: Nested path for object access
      },
    ],
  },
  // Include ALL panels, even conditional ones
];
```

### Step 5: Update Routing
Add detail route to `src/pages/browser-app/[component]/index.tsx`:

```typescript
import { FunctionComponent } from 'react'
import { Routes, Route } from 'react-router-dom'
import [Model]List from './components/list'
import Create[Model] from './components/create'
import [Model]Detail from './components/detail'

interface [Component]Props {}

const [Component]: FunctionComponent<[Component]Props> = () => {
  return (
    <Routes>
      <Route path="" element={<[Model]List />} />
      <Route path="create" element={<Create[Model] />} />
      <Route path=":id/edit" element={<Create[Model] />} />
      <Route path=":id/detail" element={<[Model]Detail />} />
    </Routes>
  )
}

export default [Component]
```

### Step 6: Update List Component
Add detail links to `src/pages/browser-app/[component]/components/list/index.tsx`:

```typescript
const columns = [
  {
    label: 'Name/Title',
    custom: ({ _id, name }: { _id: string; name: string }) => (
      <Anchor asLink href={`/[component]/${_id}/detail`}>
        {name}
      </Anchor>
    ),
  },
  // ... other columns
]
```

### Step 7: Add INITIAL_[MODEL] Constant
Update `src/types/index.ts` to include the initial constant:

```typescript
export const INITIAL_[MODEL]: [Model]Model = {
  // Define all required fields with default values
  _id: '',
  name: '',
  // ... all other required fields
}
```

### Step 8: Create Component Styles
Create `src/pages/browser-app/[component]/components/detail/style.scss`:

```scss
@import '@sass/mixins';

.[component]-detail {
  &__header {
    margin-bottom: 24px;
  }

  &__content {
    // Add any specific styling needed
  }
}
```

## Key Patterns to Follow

### 1. **EXACT Panel Structure Preservation**
```typescript
// ❌ WRONG: Generic panel names
export const componentDetailsFields: Panel[] = [
  {
    panel: 'Basic Information', // Generic name
    fields: [...]
  }
]

// ✅ CORRECT: Exact panel names from create component
export const advanceBookingDetailsFields: Panel[] = [
  {
    panel: 'Booking Details', // EXACT title from create component
    fields: [...]
  },
  {
    panel: 'Customer Details', // EXACT title from create component
    fields: [...]
  },
  {
    panel: 'Comment', // EXACT title from create component
    fields: [...]
  }
]
```

### 2. **EXACT Field Order Preservation**
```typescript
// ❌ WRONG: Different field order
fields: [
  { label: 'Drop Off Location', path: 'dropOffLocation' },
  { label: 'Pickup Location', path: 'pickUpLocation' }, // Wrong order
]

// ✅ CORRECT: Exact field order from create component
fields: [
  { label: 'Pickup Location', path: 'pickUpLocation' }, // Correct order
  { label: 'Drop Off Location', path: 'dropOffLocation' },
]
```

### 3. **🆕 CRITICAL: Nested Object Path Handling**
```typescript
// ❌ WRONG: Flattening object fields to custom names
fields: [
  { label: 'Customer', path: 'customerName' }, // Custom field name
  { label: 'Package', path: 'packageCode' }, // Custom field name
]

// ✅ CORRECT: Use nested paths for object access
fields: [
  { label: 'Customer', path: 'monthlyFixedDetails.customer.name' }, // Nested path
  { label: 'Package', path: 'monthlyFixedDetails.package.packageCode' }, // Nested path
]
```

### 4. **🆕 CRITICAL: Object Structure Preservation in Data Transformation**
```typescript
// ❌ WRONG: Flattening objects to custom field names
const transformData = (data: VehicleModel): TransformedVehicleData => {
  return {
    ...data,
    customerName: data.monthlyFixedDetails?.customer?.name || '-', // Flattened
    packageCode: data.monthlyFixedDetails?.package?.packageCode || '-', // Flattened
  }
}

// ✅ CORRECT: Preserve object structure for nested path access
const transformData = (data: VehicleModel): TransformedVehicleData => {
  return {
    ...data,
    monthlyFixedDetails: data.monthlyFixedDetails ? {
      ...data.monthlyFixedDetails,
      customer: (() => {
        const customer = data.monthlyFixedDetails.customer
        if (!customer) return '-'
        if (typeof customer === 'object' && 'name' in customer) {
          return customer // Preserve object structure
        }
        return { name: customer.toString() } // Create object structure
      })(),
      package: (() => {
        const pkg = data.monthlyFixedDetails.package
        if (!pkg) return '-'
        if (typeof pkg === 'object' && 'packageCode' in pkg) {
          return pkg // Preserve object structure
        }
        return { packageCode: pkg.toString() } // Create object structure
      })(),
    } : null,
  }
}
```

### 5. **🆕 CRITICAL: Conditional Panel Removal with .filter()**
```typescript
// ❌ WRONG: Using .map() which leaves empty panels
const createFilteredTemplate = (originalTemplate: Panel[], data: VehicleModel): Panel[] => {
  return originalTemplate.map(panel => {
    if (panel.panel.includes('Monthly Fixed')) {
      return data.isMonthlyFixed ? panel : { ...panel, fields: [] } // Creates empty panel
    }
    return panel
  })
}

// ✅ CORRECT: Using .filter() to completely remove conditional panels
const createFilteredTemplate = (originalTemplate: Panel[], data: VehicleModel): Panel[] => {
  return originalTemplate.filter(panel => {
    if (panel.panel.includes('Monthly Fixed')) {
      return data.isMonthlyFixed // Completely removes panel when false
    }
    return true
  })
}
```

### 6. **Error Handling and Loading States**
```typescript
// ✅ CORRECT: Complete error handling pattern
const [Model]Detail: FunctionComponent<[Model]DetailProps> = () => {
  const { data: current[Model]Data, isLoading, error } = use[Model]ByIdQuery(params.id || '')

  return (
    <div className={bemClass([blk, 'content'])}>
      {isLoading ? (
        <Loader type="form" />
      ) : error ? (
        <Alert
          type="error"
          message={`Unable to get the ${[model]} details, please try later`}
        />
      ) : (
        <PageDetail
          pageData={[model]Data || INITIAL_[MODEL]}
          pageDataTemplate={filteredTemplate}
        />
      )}
    </div>
  )
}
```

## Common Field Types & Handling

### **🆕 Object Reference Fields (CRITICAL)**
Most important pattern learned from vehicle implementation:
- **API responses return objects**: `{_id: "...", name: "..."}` instead of just string IDs
- **Use nested paths in model**: `customer.name`, `package.packageCode`, `staff.name`
- **Preserve object structure**: Don't flatten to custom field names
- **Handle both object and string responses**: Check type and create consistent structure

```typescript
// ✅ CORRECT Pattern for Object References
customer: (() => {
  const customer = data.monthlyFixedDetails.customer
  if (!customer) return '-'
  // If it's already an object, return as is for nested path access
  if (typeof customer === 'object' && 'name' in customer) {
    return customer
  }
  // If it's a string, create object structure for consistency
  return { name: customer.toString() }
})(),
```

### **ConfiguredInput Fields**
- Check the create component for `CONFIGURED_INPUT_TYPES`
- Map the configuration properly in the detail model
- Handle the display value transformation
- These appear as regular TextInput in detail view

### **API-Dependent Select Fields**
- Fields that get options from API calls (customers, packages, staff)
- **CRITICAL**: These often return objects `{_id, name}` in API responses
- Display the appropriate label/name field using nested paths
- Handle both object and string responses gracefully

### **Boolean Fields (RadioGroup in create)**
- Use `formatBooleanValueForDisplay()` utility
- Transform true/false to "Yes"/"No" display values
- Common fields: `hasAc`, `isActive`, `isMonthlyFixed`

### **Date Fields**
- Use `formatDateValueForDisplay()` utility
- Handle null/undefined dates gracefully
- Common in contract dates, booking dates

### **Number Fields**
- Convert to string for display: `noOfSeats?.toString() || '-'`
- Handle null/undefined values with fallback

### **Conditional Fields & Panels**
- Fields that show/hide based on other field values
- **CRITICAL**: Use `.filter()` to completely remove conditional panels
- Ensure the logic matches the create component exactly
- Common pattern: Monthly fixed details showing only when `isMonthlyFixed = true`

## Error Handling & Edge Cases

### **Loading States**
- Handle `isLoading` state properly
- Show loader while data is being fetched
- Provide fallback data using `INITIAL_[MODEL]`

### **Error States**
- Handle API errors gracefully with `error` from query hook
- Show appropriate error messages using Alert component
- Provide consistent error message format: `Unable to get the [model] details, please try later`

### **Data Transformation Edge Cases**
- Handle null/undefined values with fallback `'-'` or empty string
- Format dates, booleans, numbers appropriately
- Extract nested object properties safely with type checking
- **🆕 Handle mixed object/string API responses**: Some fields may return objects or strings inconsistently

### **🆕 Conditional Logic Edge Cases**
- Empty panels showing when conditions are false
- Object fields showing as `[object Object]` instead of proper values
- Missing object property names (customer names, package codes)
- Inconsistent API response formats between different endpoints

## 🆕 Common Issues & Solutions

### **Issue 1: Empty Panels Displaying**
**Problem**: Conditional panels show as empty when condition is false
**Root Cause**: Using `.map()` with empty fields instead of `.filter()`
**Solution**: Use `.filter()` to completely remove conditional panels

```typescript
// ❌ WRONG: Creates empty panels
const filtered = template.map(panel => 
  condition ? panel : { ...panel, fields: [] }
)

// ✅ CORRECT: Removes panels completely
const filtered = template.filter(panel => 
  panel.panel.includes('Conditional') ? condition : true
)
```

### **Issue 2: Object Fields Showing as [object Object]**
**Problem**: API returns objects but detail shows `[object Object]` instead of field values
**Root Cause**: Flattening object structure breaks nested path resolution
**Solution**: Preserve object structure and use nested paths in model

```typescript
// ❌ WRONG: Flattening breaks nested path access
transformData = (data) => ({
  customerName: data.customer?.name || '-' // Flattened
})
// Model: { label: 'Customer', path: 'customerName' }

// ✅ CORRECT: Preserve structure for nested paths
transformData = (data) => ({
  customer: data.customer || { name: '-' } // Preserved structure
})
// Model: { label: 'Customer', path: 'customer.name' }
```

### **Issue 3: Missing Object Property Names**
**Problem**: Customer names, package codes, staff names not displaying
**Root Cause**: API returns full objects but paths expect specific properties
**Solution**: Use nested object paths in model and ensure object structure preservation

```typescript
// ✅ Pattern from AdvanceBookingDetail (working example)
fields: [
  { label: 'Customer', path: 'customer.name' },
  { label: 'Package', path: 'package.packageCode' },
  { label: 'Staff', path: 'staff.name' },
]
```

## Testing Checklist

- [ ] TypeScript compilation passes without errors
- [ ] All fields display correctly with proper values (not `[object Object]`)
- [ ] **🆕 Object reference fields show proper names/codes** (customer names, package codes, staff names)
- [ ] Conditional fields work as expected
- [ ] **🆕 Conditional panels are completely hidden when conditions are false** (no empty panels)
- [ ] Object fields are handled properly with nested path resolution
- [ ] Loading states work (shows loader while fetching)
- [ ] Error states are handled (shows alert on API errors)
- [ ] Navigation works correctly (detail links from list page)
- [ ] Styling matches the design system
- [ ] **🆕 Boolean fields show "Yes"/"No" instead of "true"/"false"**
- [ ] **🆕 Date fields are formatted properly**
- [ ] **🆕 All panel titles match exactly with create/edit component**
- [ ] **🆕 Field order matches exactly with create/edit component**

## 🆕 Debugging Tips

1. **Add temporary console logs** to understand API response structure:
   ```typescript
   console.log('Raw API data:', data)
   console.log('Nested object:', data.monthlyFixedDetails)
   console.log('Customer data:', data.monthlyFixedDetails?.customer, typeof data.monthlyFixedDetails?.customer)
   ```

2. **Check PageDetail component requirements**:
   - Nested paths work when object structure is preserved
   - Flattened data breaks nested path resolution

3. **Verify conditional logic**:
   - Test with both true/false conditions
   - Ensure panels disappear completely, not just become empty

4. **Test object vs string API responses**:
   - Some APIs return `{_id: "...", name: "..."}` objects
   - Others return just string IDs
   - Handle both cases consistently

## Usage Instructions

1. **🆕 CRITICAL: Analyze API response structure first** - Add console logs to see actual data format
2. **Replace placeholders** with actual component names
3. **Analyze the create component** thoroughly for EXACT panel structure
4. **🆕 Use nested object paths** for reference fields (customer.name, package.packageCode)
5. **Map all fields** from create to detail model in EXACT order
6. **🆕 Use .filter() for conditional panels** instead of .map() with empty fields
7. **Handle conditional logic** with complete panel removal
8. **🆕 Preserve object structure** in data transformation instead of flattening
9. **Test all scenarios** including edge cases and conditional states
10. **🆕 Remove debug console logs** after implementation is complete
11. **Follow naming conventions** consistently

## Example Implementation

For a `Vehicle` component, the prompt would be:

```
Create a detail component for the Vehicle entity following the AdvanceBookingDetail pattern.

**Component Details:**
- Model: VehicleModel
- API Query: useVehicleByIdQuery
- Create Component: src/pages/browser-app/vehicles/components/create/index.tsx
- List Component: src/pages/browser-app/vehicles/components/list/index.tsx
- Route: /vehicles

**Key Fields to Handle:**
- ConfiguredInput for vehicle type
- API-dependent staff field (object response: {_id, name})
- API-dependent customer field (object response: {_id, name})  
- API-dependent package field (object response: {_id, packageCode})
- Conditional monthly fixed details (4 separate panels)
- Date formatting for contract dates
- Boolean formatting for AC and active status

**Conditional Logic:**
- Show monthly fixed details panels only when isMonthlyFixed = true
- Show staff field only when staffCategory is selected
- Handle object responses for staff, customer, package fields
- Use .filter() to completely remove conditional panels

**Object Path Requirements:**
- Use nested paths: monthlyFixedDetails.customer.name
- Use nested paths: monthlyFixedDetails.package.packageCode  
- Use nested paths: monthlyFixedDetails.staff.name
- Preserve object structure in data transformation

Please implement step by step following the patterns from AdvanceBookingDetail.
```

## 🆕 Real-World Vehicle Implementation Example

**Successful Pattern from Vehicle Detail Implementation:**

### Model Structure (EXACT from create form):
```typescript
export const vehicleDetailsFields: Panel[] = [
  {
    panel: 'Vehicle Details', // Exact from create
    fields: [
      { label: 'Vehicle Type', path: 'type' },
      { label: 'Manufacturer', path: 'manufacturer' },
      { label: 'Vehicle Name', path: 'name' },
      { label: 'Number of Seats', path: 'noOfSeats' },
      { label: 'Registration Number', path: 'registrationNo' },
      { label: 'Is AC Required', path: 'hasAc' },
      { label: 'Is Monthly Fixed', path: 'isMonthlyFixed' },
    ],
  },
  // Conditional panels - included in model but filtered at runtime
  {
    panel: 'Monthly Fixed Customer Details',
    fields: [
      { label: 'Customer category', path: 'monthlyFixedDetails.customerCategory' },
      { label: 'Customer', path: 'monthlyFixedDetails.customer.name' }, // Nested path
    ],
  },
  {
    panel: 'Monthly Fixed Package Details', 
    fields: [
      { label: 'Package Category', path: 'monthlyFixedDetails.packageCategory' },
      { label: 'Package', path: 'monthlyFixedDetails.package.packageCode' }, // Nested path
    ],
  },
  {
    panel: 'Monthly Fixed Staff Details',
    fields: [
      { label: 'Staff Category', path: 'monthlyFixedDetails.staffCategory' },
      { label: 'Staff', path: 'monthlyFixedDetails.staff.name' }, // Nested path
    ],
  },
  // ... other panels
]
```

### Key Success Factors:
1. **Nested object paths** resolve automatically when object structure is preserved
2. **Complete panel removal** with `.filter()` prevents empty panels  
3. **Object structure preservation** enables nested path access
4. **Mixed API response handling** for both object and string returns
5. **Exact panel/field matching** with create component structure</content>
<parameter name="filePath">d:\Repos\Personal\travel-agency-ui-github\src\prompts\component-detail-creation.md

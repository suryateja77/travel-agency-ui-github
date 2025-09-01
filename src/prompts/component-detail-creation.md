# Component Detail Page Creation Guide

## ⚠️ CRITICAL REQUIREMENT
**The panel titles and fields in the detail component MUST exactly match how they are rendered in the create/edit form for that specific component.** Each component has unique panel structures and field arrangements that must be preserved.

## Overview
This guide provides a comprehensive approach for creating detail pages following the established patterns from AdvanceBookingDetail and StaffDetail components.

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
- What is the main model interface (e.g., `AdvanceBookingModel`, `StaffModel`)
- What fields contain objects vs primitive values
- Which fields are conditionally rendered based on other field values
- What API responses look like (objects with _id vs string IDs)

#### **📋 EXACT Panel Structure Mapping**
- **Panel titles**: Copy EXACTLY from create/edit component
- **Field grouping**: Maintain the SAME panel organization
- **Field order**: Preserve the EXACT order within each panel
- **Conditional panels**: Include panels that show conditionally

#### **Form Fields Analysis**
- **TextInput fields**: Simple string/number inputs
- **SelectInput fields**: Fields with predefined options
- **ConfiguredInput fields**: Dynamic inputs with configuration
- **RadioGroup fields**: Boolean or enum selections
- **API-dependent fields**: Fields that fetch options from API calls

#### **Conditional Logic**
- Fields that show/hide based on other field values
- API calls that depend on form state
- Validation rules that change based on conditions

### 2. State Management Patterns
- How the form state is initialized
- What the reducer pattern looks like
- How field changes are handled
- How API data is transformed

## Implementation Steps

### Step 1: Analyze Create/Edit Component Structure
**CRITICAL**: Before writing any code, document the EXACT panel structure:

1. **Open the create/edit component** and identify all panels
2. **List panel titles** in the exact order they appear
3. **For each panel**, list all fields in their exact order
4. **Note conditional panels** and their trigger conditions
5. **Document field types** (TextInput, SelectInput, ConfiguredInput, etc.)

**Example Analysis for AdvanceBooking:**
```
Panel 1: "Booking Details"
  - Customer Type (RadioGroup)
  - Pickup Location (TextInput)
  - Drop Off Location (TextInput)
  - Pickup Date and Time (TextInput type="datetime-local")
  - Number of Seats (TextInput type="number")
  - Vehicle Type (SelectInput)
  - Air Conditioning (RadioGroup)

Panel 2: "Customer Details" (conditional: shows when customerType is selected)
  - Customer Category (SelectInput) - only for existing customers
  - Customer (SelectInput) - only for existing customers
  - Customer Name (TextInput) - only for new customers
  - Customer Contact (TextInput) - only for new customers
  - Customer Email (TextInput) - only for new customers

Panel 3: "Comment"
  - Comment (TextArea)
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
  // Include ALL panels, even conditional ones
];
```

### Step 3: Create Detail Component
Create `src/pages/browser-app/[component]/components/detail/index.tsx`:

```typescript
// ... imports

const [Model]Detail: FunctionComponent<[Model]DetailProps> = () => {
  // ... component logic

  // CRITICAL: Ensure filteredTemplate maintains EXACT panel structure
  const filteredTemplate = useMemo(() => {
    if (!current[Model]Data) {
      return [component]DetailsFields
    }
    return createFilteredTemplate([component]DetailsFields, current[Model]Data)
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
        ) : (
          <PageDetail
            pageData={[model]Data || INITIAL_[MODEL]}
            pageDataTemplate={filteredTemplate} // This preserves EXACT panel structure
          />
        )}
      </div>
    </div>
### Step 2: Create Detail Component
Create `src/pages/browser-app/[component]/components/detail/index.tsx`:

```typescript
import Text from '@base/text'
import { bemClass, formatBooleanValueForDisplay, formatDateValueForDisplay } from '@utils'
import React, { FunctionComponent, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

import './style.scss'
import Loader from '@components/loader'
import { [component]DetailsFields } from './model'
import { [Model]Model, INITIAL_[MODEL], Panel, Field } from '@types'
import PageDetail from '@base/page-detail'
import { use[Model]ByIdQuery } from '@api/queries/[component]'

const blk = '[component]-detail'

interface [Model]DetailProps {}

interface Transformed[Model]Data extends Record<string, any> {
  // Define all expected fields with proper types
}

const formatFieldValue = (value: any): string => {
  // Handle field formatting
}

// Transform the data to handle object references and formatting
const transform[Model]Data = (data: [Model]Model): Transformed[Model]Data => {
  return {
    ...data,
    // Handle all field transformations
  }
}

// Create filtered template based on conditional logic
const createFilteredTemplate = (originalTemplate: Panel[], data: [Model]Model): Panel[] => {
  return originalTemplate.map(panel => {
    // Apply conditional filtering logic
  })
}

const [Model]Detail: FunctionComponent<[Model]DetailProps> = () => {
  const params = useParams()

  const { data: current[Model]Data, isLoading } = use[Model]ByIdQuery(params.id || '')
  const [[model]Data, set[Model]Data] = useState<Transformed[Model]Data | null>(null)

  // Memoize the filtered template
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

### Step 3: Create Detail Model
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
  // Include ALL panels, even conditional ones
];
```

### Step 4: Update Routing
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
```

### Step 4: Update List Component
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

### 3. **Object Field Handling**
```typescript
// Handle API responses that return objects instead of IDs
customerName: data.customer && typeof data.customer === 'object' && 'name' in data.customer
  ? (data.customer as any).name
  : data.customer || '-'
```

### 4. **Conditional Template Filtering**
```typescript
const createFilteredTemplate = (originalTemplate: Panel[], data: [Model]Model): Panel[] => {
  return originalTemplate.map(panel => {
    // Apply conditional logic WITHOUT changing panel structure
    if (panel.panel === 'Conditional Panel') {
      const filteredFields: Field[] = panel.fields.filter(field => {
        // Only filter fields, keep panel structure intact
        return shouldShowField(field, data)
      })
      return {
        ...panel,
        fields: filteredFields
      }
    }
    return panel // Return other panels unchanged
  })
}
```

## Common Field Types & Handling

### **ConfiguredInput Fields**
- Check the create component for `CONFIGURED_INPUT_TYPES`
- Map the configuration properly in the detail model
- Handle the display value transformation

### **API-Dependent Select Fields**
- Fields that get options from API calls
- Handle both object and string responses
- Display the appropriate label/name field

### **Conditional Fields**
- Fields that show/hide based on other field values
- Use `createFilteredTemplate` to filter fields dynamically
- Ensure the logic matches the create component

## Error Handling & Edge Cases

### **Loading States**
- Handle `isLoading` state properly
- Show loader while data is being fetched
- Provide fallback data using `INITIAL_[MODEL]`

### **Error States**
- Handle API errors gracefully
- Show appropriate error messages
- Provide navigation back options

### **Data Transformation**
- Handle null/undefined values
- Format dates, booleans, numbers appropriately
- Extract nested object properties safely

## Testing Checklist

- [ ] TypeScript compilation passes
- [ ] All fields display correctly
- [ ] Conditional fields work as expected
- [ ] Object fields are handled properly
- [ ] Loading states work
- [ ] Error states are handled
- [ ] Navigation works correctly
- [ ] Styling matches the design system

## Usage Instructions

1. **Replace placeholders** with actual component names
2. **Analyze the create component** thoroughly
3. **Map all fields** from create to detail model
4. **Handle conditional logic** properly
5. **Test all scenarios** including edge cases
6. **Follow naming conventions** consistently

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
- API-dependent staff field (object response)
- Conditional monthly fixed details
- Date formatting for contract dates
- Boolean formatting for AC and active status

**Conditional Logic:**
- Show monthly fixed details only when isMonthlyFixed = true
- Show staff field only when staffCategory is selected
- Handle object responses for staff field

Please implement step by step following the patterns from AdvanceBookingDetail.
```</content>
<parameter name="filePath">d:\Repos\Personal\travel-agency-ui-github\src\prompts\component-detail-creation.md

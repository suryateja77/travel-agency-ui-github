# Component Modernization & Optimization Guide

## Overview
This guide provides a comprehensive approach for modernizing and optimizing React/TypeScript create/edit components following established best practices and patterns.

## Analysis Requirements

Before making any changes, thoroughly analyze the current component and understand:

### 1. State Management Patterns
- Current state management approach (useState vs useReducer vs custom hooks)
- How form data is structured and updated
- State initialization and reset patterns
- Validation state management
- Modal/UI state handling

### 2. Component Architecture & Naming
- File structure and organization
- Naming conventions for variables, functions, and types
- Component hierarchy and composition patterns
- BEM class naming and CSS organization
- Import/export patterns

### 3. Business Logic Implementation
- Core business rules and workflows
- Data transformation logic (API response to form state)
- Conditional rendering based on business rules
- Form submission and data preparation logic
- Navigation and routing patterns

### 4. API Integration Patterns
- React Query usage for data fetching (queries and mutations)
- Conditional API calls based on form state
- API error handling and user feedback
- Loading states and error boundaries
- Data transformation between API and UI formats

### 5. Form Field Management
- Types of form inputs used (TextInput, SelectInput, ConfiguredInput, Toggle, etc.)
- Field validation patterns and error display
- Dynamic field behavior (conditional fields, dependent dropdowns)
- Field change handlers and event management
- Required field handling and user guidance

### 6. Validation & Error Handling
- Validation schema structure and implementation
- Real-time vs submission validation
- Error message display and user experience
- API error integration with form validation
- User feedback patterns (alerts, inline errors, modals)

### 7. User Experience & Accessibility
- Loading states and skeleton screens
- Confirmation dialogs and user feedback
- Form reset and data preservation patterns
- Navigation and breadcrumb implementation
- Responsive design considerations

## Transformation Requirements

After understanding the current implementation, modernize the component with these changes while **preserving all existing business logic and functionality**:

### 1. State Management Modernization

Replace multiple useState hooks with a useReducer pattern:

```typescript
// Define comprehensive state interface
interface ComponentState {
  formData: EntityModel
  isEditing: boolean
  entityId: string
  validationErrors: ValidationErrors
  isValidationError: boolean
  showConfirmationModal: boolean
  confirmationModal: ConfirmationModal
  apiErrors: ApiErrors
  selectOptions: SelectOptions
}

// Define action types
type ComponentAction = 
  | { type: 'SET_ENTITY'; payload: EntityModel }
  | { type: 'UPDATE_FIELD'; payload: { field: keyof EntityModel; value: any } }
  | { type: 'SET_VALIDATION_ERRORS'; payload: { errors: ValidationErrors; hasError: boolean } }
  | { type: 'SET_CONFIRMATION_MODAL'; payload: Partial<ConfirmationModal> & { show: boolean } }
  | { type: 'SET_API_ERROR'; payload: { dataType: string; error: string } }
  | { type: 'SET_SELECT_OPTIONS'; payload: { dataType: string; options: SelectOption[] } }

// Implement reducer with proper TypeScript typing
function componentReducer(state: ComponentState, action: ComponentAction): ComponentState {
  switch (action.type) {
    // Implement all cases with proper state updates
    default:
      return state
  }
}
```

### 2. TypeScript Enhancement

- **Replace all `any` types** with specific interfaces
- **Create proper interfaces** for API responses, form data, and component props
- **Add comprehensive type safety** for all form fields and API interactions
- **Implement proper generic types** for reusable functions

```typescript
interface EntityResponseModel extends Omit<EntityModel, 'complexField'> {
  _id: string
  complexField?: {
    // Define nested structure with proper types
  }
}

interface SelectOption {
  key: string
  value: string
}

interface ValidationErrors {
  [key: string]: string
}
```

### 3. Performance Optimizations

- **Implement `useCallback`** for all event handlers to prevent unnecessary re-renders
- **Add `useMemo`** for expensive calculations and derived state
- **Optimize re-renders** with proper dependency arrays
- **Implement conditional API queries** to avoid unnecessary requests

```typescript
const handleFieldChange = useCallback(
  <K extends keyof EntityModel>(field: K, value: EntityModel[K]) => {
    dispatch({ type: 'UPDATE_FIELD', payload: { field, value } })
  },
  []
)

const memoizedSelectOptions = useMemo(
  () => getSelectOptions(isLoading, isError, options, 'Loading...', 'Error', 'No data'),
  [isLoading, isError, options]
)
```

### 4. Code Organization & Constants

Extract all magic strings and organize code into clear sections:

```typescript
// ============================================================================
// CONSTANTS
// ============================================================================
const INITIAL_ENTITY: EntityModel = {
  // Define initial state
} as const

const API_ERROR_MESSAGES = {
  fieldName: 'Unable to load data. Please check your connection and try again.',
} as const

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
const transformApiResponse = (response: EntityResponseModel): EntityModel => {
  // Implementation
}

// ============================================================================
// COMPONENT IMPLEMENTATION
// ============================================================================
```

### 5. Error Handling & UX

- **Implement comprehensive error boundaries**
- **Add proper loading states** for all async operations
- **Create consistent error message patterns**
- **Implement user-friendly confirmation dialogs**

```typescript
const handleApiResponse = useCallback(
  <T extends { _id: string; name?: string }>(
    data: { data?: T[] } | undefined,
    error: any,
    isError: boolean,
    dataType: string,
    mapFunction: (item: T) => SelectOption
  ) => {
    if (isError && error) {
      dispatch({
        type: 'SET_API_ERROR',
        payload: { dataType, error: API_ERROR_MESSAGES[dataType] },
      })
    } else if (data?.data && data.data.length > 0) {
      const options = data.data.map(mapFunction)
      dispatch({ type: 'SET_SELECT_OPTIONS', payload: { dataType, options } })
    }
  },
  []
)
```

### 6. API Integration Optimization

- **Use conditional queries** based on form state
- **Implement proper error handling** for all API calls
- **Add retry mechanisms** where appropriate
- **Optimize data transformation functions**

```typescript
// Memoized category paths for API calls
const categoryPaths = useMemo(() => ({
  relatedEntity: formData.someField && formData.relatedCategory
    ? nameToPath(formData.relatedCategory)
    : '',
}), [formData.someField, formData.relatedCategory])

// Conditional API queries
const relatedDataQuery = useRelatedDataByCategory(categoryPaths.relatedEntity)
```

## Implementation Guidelines

### 1. Preserve Business Logic
- Ensure all existing functionality works exactly as before
- Maintain the same user workflows and business rules
- Keep all conditional logic and validations intact

### 2. Maintain API Contracts
- Keep the same API endpoints and data structures
- Preserve request/response formats
- Maintain backward compatibility

### 3. Follow TypeScript Best Practices
- Use strict typing throughout the component
- Eliminate any `any` types where possible
- Implement proper generic constraints

### 4. Implement Step-by-Step
- Make changes incrementally to avoid breaking functionality
- Test each modification before proceeding
- Verify TypeScript compilation after each step

### 5. Add Comprehensive Comments
- Document complex business logic and optimization reasoning
- Explain the purpose of utility functions
- Add section dividers for better code organization

### 6. Test Each Change
- Verify functionality after each major modification
- Check for TypeScript errors regularly
- Ensure all form validations still work

## Specific Patterns to Follow

### Component Structure Template

```typescript
import React, { FunctionComponent, useEffect, useMemo, useCallback, useReducer } from 'react'
// ... other imports organized by type

const blk = 'component-name'

// ============================================================================
// TYPESCRIPT INTERFACES & TYPES
// ============================================================================
interface ComponentProps {
  // Define props
}

// ============================================================================
// CONSTANTS
// ============================================================================
const INITIAL_STATE = {
  // Define constants
} as const

// ============================================================================
// REDUCER & INITIAL STATE
// ============================================================================
const initialState: ComponentState = {
  // Initial state
}

function componentReducer(state: ComponentState, action: ComponentAction): ComponentState {
  // Reducer implementation
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
const utilityFunction = (param: Type): ReturnType => {
  // Implementation
}

// ============================================================================
// COMPONENT IMPLEMENTATION
// ============================================================================
const ComponentName: FunctionComponent<ComponentProps> = ({ props }) => {
  // Component implementation with proper hooks organization
  
  // ============================================================================
  // HANDLERS
  // ============================================================================
  const handleSomething = useCallback(() => {
    // Implementation
  }, [dependencies])
  
  // ============================================================================
  // EFFECTS
  // ============================================================================
  useEffect(() => {
    // Effect implementation
  }, [dependencies])
  
  // ============================================================================
  // MEMOIZED VALUES
  // ============================================================================
  const memoizedValue = useMemo(() => {
    // Computation
  }, [dependencies])
  
  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    // JSX implementation
  )
}

export default ComponentName
```

## Expected Outcome

A modernized, type-safe, performant component that:

- ✅ Maintains 100% of original business functionality
- ✅ Uses proper TypeScript typing throughout
- ✅ Implements performance optimizations
- ✅ Follows React best practices
- ✅ Has improved code organization and readability
- ✅ Serves as a reference implementation for similar components
- ✅ Provides better developer experience and maintainability

## Usage Instructions

1. **Attach this guide** to your prompt when asking an AI agent to modernize a component
2. **Specify the component path** you want to modernize
3. **Mention any specific business requirements** or constraints
4. **Request step-by-step implementation** to ensure proper testing
5. **Ask for verification** of TypeScript compilation and functionality

Example prompt: "Using the attached component modernization guide, please analyze and modernize the component at `src/components/example/create/index.tsx` following all the patterns and requirements specified in the guide."

# DateTimeInput Component

## Overview

A reusable React component for handling date and datetime-local input fields with proper validation, formatting, and error handling. Built following the established patterns in the Travel Agency Management System.

## Features

- ✅ Supports both `date` and `datetime-local` input types
- ✅ Handles Date objects, ISO strings, and null values
- ✅ Automatic date/time formatting for input fields
- ✅ Min/max date validation support
- ✅ Disabled state with proper styling
- ✅ Error validation display
- ✅ Required field indicator
- ✅ Consistent with other base components (TextInput, NumberInput)
- ✅ BEM methodology for styling
- ✅ SASS variables and mixins
- ✅ Prevents keyboard input (forces date picker usage)

## Usage

### Import

```typescript
import { DateTimeInput } from '@base'
```

### Basic DateTime Input

```typescript
<DateTimeInput
  label="Pickup Date and Time"
  name="pickUpDateTime"
  type="datetime-local"
  value={formData.pickUpDateTime}
  changeHandler={(value) => setFormData({ 
    ...formData, 
    pickUpDateTime: value.pickUpDateTime 
  })}
  required
/>
```

### Date Only Input

```typescript
<DateTimeInput
  label="Payment Date"
  name="paymentDate"
  type="date"
  value={formData.paymentDate}
  changeHandler={(value) => setFormData({ 
    ...formData, 
    paymentDate: value.paymentDate 
  })}
  required
/>
```

### With Validation

```typescript
<DateTimeInput
  label="Start Date"
  name="startDate"
  type="datetime-local"
  value={formData.startDate}
  changeHandler={(value) => setFormData({ 
    ...formData, 
    startDate: value.startDate 
  })}
  onBlur={() => validateField('startDate', formData)}
  required
  errorMessage={errorMap['startDate']}
  invalid={!!errorMap['startDate']}
/>
```

### With Min/Max Dates

```typescript
<DateTimeInput
  label="End Date"
  name="endDate"
  type="datetime-local"
  value={formData.endDate}
  min={formData.startDate}  // Can't be before start date
  max={new Date()}  // Can't be in the future
  changeHandler={(value) => setFormData({ 
    ...formData, 
    endDate: value.endDate 
  })}
  required
/>
```

### Disabled State

```typescript
<DateTimeInput
  label="Created Date"
  name="createdDate"
  type="datetime-local"
  value={formData.createdDate}
  disabled={true}
  changeHandler={() => {}}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `''` | Label text displayed above input |
| `type` | `'date' \| 'datetime-local'` | `'datetime-local'` | Type of date input |
| `value` | `Date \| string \| null` | `null` | Current value (Date object, ISO string, or null) |
| `name` | `string` | `''` | Input field name (used in changeHandler) |
| `changeHandler` | `(arg: { [name]: Date \| null }) => void` | `() => {}` | Callback when value changes, receives Date object or null |
| `disabled` | `boolean` | `false` | Disables the input field |
| `required` | `boolean` | `false` | Shows asterisk for required field |
| `invalid` | `boolean` | `false` | Shows error state styling |
| `valid` | `boolean` | `false` | Shows success state styling |
| `errorMessage` | `string` | `''` | Error message to display |
| `onBlur` | `() => void` | `undefined` | Callback when field loses focus |
| `min` | `Date \| string` | `undefined` | Minimum allowed date |
| `max` | `Date \| string` | `undefined` | Maximum allowed date |
| `size` | `'small' \| 'large'` | `''` | Input field size variant |
| `rounded` | `boolean` | `false` | Rounded corners styling |
| `className` | `string` | `''` | Additional CSS classes for container |
| `controlClasses` | `string` | `''` | Additional CSS classes for input field |
| `autoComplete` | `string` | `'off'` | HTML autocomplete attribute |

## Data Handling

### Value Format

The component accepts three value formats:
- `Date` object (preferred)
- ISO string (e.g., `"2024-12-20T14:30:00.000Z"`)
- `null` (for empty/unselected)

### Change Handler Format

The `changeHandler` receives an object with the field name as key and Date object (or null) as value:

```typescript
changeHandler={(value) => {
  // value = { pickUpDateTime: Date | null }
  setFormData({ ...formData, ...value })
}}
```

### Backend Compatibility

The component maintains full compatibility with the backend:
- Sends: Date objects (serialized to ISO strings by axios/JSON.stringify)
- Receives: ISO strings (from API response)
- Handles: Both formats transparently

## Validation Pattern

### Field-Level Validation

```typescript
const validateField = (fieldPath: string, data: FormData) => {
  const { isValid, errorMap } = validatePayload(
    validationSchema,
    data
  )
  setErrors({ ...errors, [fieldPath]: errorMap[fieldPath] })
}

<DateTimeInput
  label="Pickup Date"
  name="pickUpDate"
  value={formData.pickUpDate}
  changeHandler={(value) => {
    setFormData({ ...formData, ...value })
    validateField('pickUpDate', { ...formData, ...value })
  }}
  onBlur={() => validateField('pickUpDate', formData)}
  errorMessage={errors['pickUpDate']}
  invalid={!!errors['pickUpDate']}
  required
/>
```

### Form-Level Validation

```typescript
const handleSubmit = async () => {
  const { isValid, errorMap } = validatePayload(
    validationSchema,
    formData
  )
  
  if (!isValid) {
    setErrors(errorMap)
    return
  }
  
  // Submit form
  await createMutation.mutateAsync(formData)
}
```

## Styling

The component follows BEM methodology and uses SASS variables from the project's design system.

### CSS Classes

- `.datetime-input` - Container
- `.datetime-input__inputField` - Input field
- `.datetime-input__inputField--disabled` - Disabled state
- `.datetime-input__inputField--invalid` - Error state
- `.datetime-input__inputField--valid` - Success state
- `.datetime-input__inputField--small` - Small size
- `.datetime-input__inputField--large` - Large size
- `.datetime-input__icon` - Validation icon
- `.datetime-input__label` - Label text
- `.datetime-input__star` - Required indicator

### SASS Variables Used

- `$white` - Background color
- `$gray` - Disabled text color
- `$gray-light` - Default border color
- `$gray-lightest` - Disabled background
- `$primary` - Focus border color
- `$success` - Valid state color
- `$error` - Invalid state color

## Keyboard Behavior

The component prevents all keyboard input except navigation keys:
- **Allowed**: Tab, Shift, Enter, Escape
- **Blocked**: All other keys (forces date picker usage)

This ensures consistent date format and prevents invalid input.

## Browser Compatibility

- Chrome/Edge: Native datetime picker
- Firefox: Native datetime picker
- Safari: Native datetime picker
- Mobile browsers: Shows native date/time picker optimized for touch

## Migration Guide

### From TextInput with type="datetime-local"

**Before:**
```typescript
import { formatDateTimeForInput, parseDateTimeFromInput } from '@utils'

<TextInput
  label="Pickup Date"
  name="pickUpDateTime"
  type="datetime-local"
  value={formatDateTimeForInput(
    formData.pickUpDateTime ? new Date(formData.pickUpDateTime) : null
  )}
  changeHandler={(value) => {
    setFormData({
      ...formData,
      pickUpDateTime: parseDateTimeFromInput(value.pickUpDateTime?.toString() || '')
    })
  }}
  required
/>
```

**After:**
```typescript
<DateTimeInput
  label="Pickup Date"
  name="pickUpDateTime"
  type="datetime-local"
  value={formData.pickUpDateTime}
  changeHandler={(value) => {
    setFormData({ ...formData, ...value })
  }}
  required
/>
```

### From TextInput with type="date"

**Before:**
```typescript
<TextInput
  label="Payment Date"
  name="paymentDate"
  type="date"
  value={formData.paymentDate ? formatDateTimeForInput(new Date(formData.paymentDate)).split('T')[0] : ''}
  changeHandler={(value) => {
    setFormData({
      ...formData,
      paymentDate: value.paymentDate ? new Date(value.paymentDate) : null
    })
  }}
  required
/>
```

**After:**
```typescript
<DateTimeInput
  label="Payment Date"
  name="paymentDate"
  type="date"
  value={formData.paymentDate}
  changeHandler={(value) => {
    setFormData({ ...formData, ...value })
  }}
  required
/>
```

## Implementation Details

### Internal Formatting

The component handles formatting internally:

1. **Input → Display**: Converts Date/string to input format
   - `date`: `YYYY-MM-DD`
   - `datetime-local`: `YYYY-MM-DDTHH:MM`

2. **User Selection → State**: Converts input string to Date object
   - Parses input value as local time
   - Returns Date object via changeHandler

### Min/Max Validation

Min/max props accept both Date objects and ISO strings:

```typescript
<DateTimeInput
  min={new Date('2024-01-01')}  // Date object
  max="2024-12-31T23:59:59"      // ISO string
/>
```

Both are automatically converted to the correct input format.

## Testing

### Unit Test Example

```typescript
describe('DateTimeInput', () => {
  it('should format Date object for datetime-local input', () => {
    const date = new Date('2024-12-20T14:30:00')
    const { getByLabelText } = render(
      <DateTimeInput
        label="Test Date"
        name="testDate"
        type="datetime-local"
        value={date}
        changeHandler={() => {}}
      />
    )
    const input = getByLabelText('Test Date') as HTMLInputElement
    expect(input.value).toBe('2024-12-20T14:30')
  })

  it('should call changeHandler with Date object', () => {
    const handleChange = jest.fn()
    const { getByLabelText } = render(
      <DateTimeInput
        label="Test Date"
        name="testDate"
        value={null}
        changeHandler={handleChange}
      />
    )
    const input = getByLabelText('Test Date')
    fireEvent.change(input, { target: { value: '2024-12-20T14:30' } })
    expect(handleChange).toHaveBeenCalledWith({
      testDate: expect.any(Date)
    })
  })
})
```

## Related Components

- **TextInput**: Base text input component (date inputs now replaced by DateTimeInput)
- **NumberInput**: Number input component with validation
- **SelectInput**: Dropdown selection component

## Files

- Component: `src/base/datetime-input/index.tsx`
- Styles: `src/base/datetime-input/style.scss`
- Export: `src/base/index.ts`
- Types: TypeScript interfaces defined inline

## Support

For issues or questions, refer to:
- Base Components Guide: `Prompts/02-BASE-COMPONENTS.md`
- Styling System: `Prompts/03-STYLING-SYSTEM.md`
- Code Standards: `Prompts/07-CODE-STANDARDS.md`

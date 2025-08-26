import { REGEX_CONTACT, REGEX_EMAIL, REGEX_EMPTY, REGEX_NUMBER, REGEX_NUMBER_GREATER_THAN_ZERO, REGEX_PIN_CODE } from './constant'

const emptyField = (path: any) => ({
  path,
  pattern: REGEX_EMPTY,
  message: 'Required',
  emptyCheck: true,
})

const contactField = (path: any) => ({
  path,
  pattern: REGEX_CONTACT,
  message: 'Phone No must be 10 digits',
  emptyCheck: true,
})

const emailField = (path: any) => ({
  path,
  pattern: REGEX_EMAIL,
  message: 'Enter the valid e-mail',
  emptyCheck: true,
})

const numberField = (path: any) => ({
  path,
  pattern: REGEX_NUMBER,
  message: 'Enter the valid number ',
  emptyCheck: true,
})

const numberFieldGreaterThanZero = (path: any) => ({
  path,
  pattern: REGEX_NUMBER_GREATER_THAN_ZERO,
  message: 'Must be greater than zero',
  emptyCheck: true,
})

const pinCodeField = (path: any) => ({
  path,
  pattern: REGEX_PIN_CODE,
  message: 'Enter the valid Pin Code',
  emptyCheck: true,
})

const dateTimeGreaterThanField = (path: any, compareToPath: any, label: string) => ({
  path,
  pattern: REGEX_EMPTY, // We'll use custom validation instead of regex
  message: `Must be greater than ${label}`,
  emptyCheck: false,
  custom: (model: any, value: any) => {
    if (!value) return false // If empty, let emptyField handle it
    const compareValue = getNestedValue(model, compareToPath)
    if (!compareValue) return true // If comparison value is empty, this validation passes
    
    const currentDate = new Date(value)
    const compareDate = new Date(compareValue)
    return currentDate > compareDate
  },
})

const numberGreaterThanField = (path: any, compareToPath: any, label: string) => ({
  path,
  pattern: REGEX_EMPTY, // We'll use custom validation instead of regex
  message: `Must be greater than ${label}`,
  emptyCheck: false,
  custom: (model: any, value: any) => {
    if (!value) return false // If empty, let emptyField handle it
    const compareValue = getNestedValue(model, compareToPath)
    if (!compareValue) return true // If comparison value is empty, this validation passes
    
    const currentValue = Number(value)
    const compareNumber = Number(compareValue)
    return currentValue > compareNumber
  },
})

// Helper function to get nested object values
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

export { emptyField, contactField, emailField, numberField, numberFieldGreaterThanZero, pinCodeField, dateTimeGreaterThanField, numberGreaterThanField }

import { emptyField, emailField, contactField, pinCodeField } from '@config/validation'
import { ClientRegistrationModel } from '@types'

// Custom validator for password match
const passwordMatchField = (path: string, compareToPath: string) => ({
  path,
  pattern: /^.*$/, // Any pattern, we'll use custom validation
  message: 'Passwords do not match',
  emptyCheck: false,
  custom: (model: any, value: any) => {
    if (!value) return false // If empty, let emptyField handle it
    const compareValue = model[compareToPath]
    return value === compareValue
  },
})

// Custom validator for password strength (minimum 8 characters)
const passwordStrengthField = (path: string) => ({
  path,
  pattern: /^.{8,}$/,
  message: 'Password must be at least 8 characters',
  emptyCheck: true,
})

const createValidationSchema = (data: ClientRegistrationModel) => {
  return [
    // Agency Details
    emptyField('agencyName'),
    emptyField('contactNumber'),
    contactField('contactNumber'),
    emptyField('email'),
    emailField('email'),
    
    // Point of Contact
    emptyField('pointOfContact.name'),
    emptyField('pointOfContact.designation'),
    emptyField('pointOfContact.contactNumber'),
    contactField('pointOfContact.contactNumber'),
    emptyField('pointOfContact.email'),
    emailField('pointOfContact.email'),
    
    // Address
    emptyField('address.addressLine1'),
    emptyField('address.city'),
    emptyField('address.state'),
    emptyField('address.pinCode'),
    pinCodeField('address.pinCode'),
    
    // Password
    emptyField('password'),
    passwordStrengthField('password'),
    emptyField('confirmPassword'),
    passwordMatchField('confirmPassword', 'password'),
  ]
}

export default createValidationSchema

import { emptyField, contactField, emailField } from '@config/validation'
import { UserModel } from '@types'

const createValidationSchema = (userData: UserModel, isEditing: boolean = false) => {
  const conditionalFields = []

  // Email validation
  if (userData.email) {
    conditionalFields.push(emailField('email'))
  }

  const baseFields = [
    emptyField('name'),
    contactField('contactNumber'),
    emptyField('email'),
    emptyField('role'),
  ]

  // Password is required only when creating new user
  if (!isEditing) {
    baseFields.push(emptyField('password'))
  }

  return [
    ...baseFields,
    ...conditionalFields,
  ]
}

export { createValidationSchema }

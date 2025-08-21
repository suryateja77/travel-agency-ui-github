import { emailField, emptyField, numberFieldGreaterThanZero } from '@config/validation'
import { StaffModel } from '@types'

const createValidationSchema = (staffData: StaffModel) => {
  const conditionalFields = staffData.email
    ? [emailField('email')]
    : []

  return [
    emptyField('name'),
    emptyField('contact'),
    emptyField('whatsAppNumber'),
    emptyField('salary'),
    numberFieldGreaterThanZero('salary'),
    emptyField('joiningDate'),
    emptyField('address.addressLine1'),
    emptyField('address.addressLine2'),
    emptyField('address.city'),
    emptyField('address.state'),
    emptyField('address.pinCode'),
    ...conditionalFields,
  ]
}

export { createValidationSchema }

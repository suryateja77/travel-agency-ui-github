import { emailField, emptyField } from '@config/validation'
import { CustomerModel } from '@types'

const createValidationSchema = (customerData: CustomerModel) => {
  const conditionalFields = customerData.email
    ? [emailField('email')]
    : []

  return [
    emptyField('name'),
    emptyField('contact'),
    emptyField('whatsAppNumber'),
    emptyField('address.addressLine1'),
    emptyField('address.addressLine2'),
    emptyField('address.city'),
    emptyField('address.state'),
    emptyField('address.pinCode'),
    ...conditionalFields,
  ]
}

export { createValidationSchema }

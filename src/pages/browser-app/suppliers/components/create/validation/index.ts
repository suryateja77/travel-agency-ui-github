import { contactField, emailField, emptyField } from '@config/validation'
import { SupplierModel } from '@types'

const createValidationSchema = (supplierData: SupplierModel) => {
  const conditionalFields = supplierData.email
    ? [emailField('email')]
    : []

  return [
    // Basic Details - required fields
    emptyField('companyName'),
    emptyField('contact'),
    contactField('contact'),
    emptyField('whatsAppNumber'),
    contactField('whatsAppNumber'),
    
    // Address fields - all required
    emptyField('address.addressLine1'),
    emptyField('address.addressLine2'),
    emptyField('address.city'),
    emptyField('address.state'),
    emptyField('address.pinCode'),
    
    // Point of Contact - all required
    emptyField('pointOfContact.name'),
    emptyField('pointOfContact.designation'),
    emptyField('pointOfContact.email'),
    emailField('pointOfContact.email'),
    emptyField('pointOfContact.contact'),
    contactField('pointOfContact.contact'),
    
    ...conditionalFields,
  ]
}

export { createValidationSchema }

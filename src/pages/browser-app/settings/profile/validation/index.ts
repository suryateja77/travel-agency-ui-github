import { contactField, emailField, emptyField } from '@config/validation'
import { UserProfile } from '@types'

const createValidationSchema = (userProfileData: UserProfile) => {
  const conditionalFields = []

  // Optional email validation (though it's read-only in UI)
  if (userProfileData.email) {
    conditionalFields.push(emailField('email'))
  }

  return [
    // Basic Information
    emptyField('firstName'),
    emptyField('lastName'),
    
    // Address fields - all required
    emptyField('address.addressLine1'),
    emptyField('address.addressLine2'),
    emptyField('address.city'),
    emptyField('address.state'),
    emptyField('address.pinCode'),
    
    // Agency Details - all required
    emptyField('agencyName'),
    emptyField('agencyRegistrationNo'),
    contactField('primaryContact'),
    contactField('secondaryContact'),
    
    ...conditionalFields,
  ]
}

export { createValidationSchema }

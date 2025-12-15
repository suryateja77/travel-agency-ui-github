import { contactField, emailField, emptyField } from '@config/validation'
import { UserProfile } from '@types'

const createValidationSchema = (userProfileData: UserProfile) => {
  const conditionalFields = []

  // Email validation for both user and agency
  if (userProfileData.email) {
    conditionalFields.push(emailField('email'))
  }
  if (userProfileData.agencyEmail) {
    conditionalFields.push(emailField('agencyEmail'))
  }
  if (userProfileData.pointOfContact.email) {
    conditionalFields.push(emailField('pointOfContact.email'))
  }

  return [
    // User Details
    emptyField('name'),
    contactField('contactNumber'),
    emptyField('email'),
    
    // Client Details
    emptyField('agencyName'),
    contactField('agencyContactNumber'),
    emptyField('agencyEmail'),
    
    // Address fields - all required
    emptyField('address.addressLine1'),
    emptyField('address.city'),
    emptyField('address.state'),
    emptyField('address.pinCode'),
    
    // Point of Contact - all required
    emptyField('pointOfContact.name'),
    emptyField('pointOfContact.designation'),
    contactField('pointOfContact.contactNumber'),
    emptyField('pointOfContact.email'),
    
    ...conditionalFields,
  ]
}

export { createValidationSchema }

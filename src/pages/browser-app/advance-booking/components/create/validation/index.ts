import { emailField, emptyField, numberFieldGreaterThanZero } from '@config/validation'
import { AdvanceBookingModel } from '@types'

const createValidationSchema = (advanceBookingData: AdvanceBookingModel) => {
  const baseFields = [
    emptyField('customerType'),
    emptyField('pickUpLocation'),
    emptyField('dropOffLocation'),
    emptyField('pickUpDateTime'),
    emptyField('noOfSeats'),
    numberFieldGreaterThanZero('noOfSeats'),
    emptyField('vehicleType'),
  ]

  // Conditional fields based on customer type
  const conditionalFields = []

  if (advanceBookingData.customerType === 'existing') {
    conditionalFields.push(
      emptyField('customerCategory'),
      emptyField('customer')
    )
  }

  if (advanceBookingData.customerType === 'new' && advanceBookingData.customerDetails) {
    conditionalFields.push(
      emptyField('customerDetails.name'),
      emptyField('customerDetails.contact')
    )
    
    // Email validation if provided
    if (advanceBookingData.customerDetails.email) {
      conditionalFields.push(emailField('customerDetails.email'))
    }
  }

  return [...baseFields, ...conditionalFields]
}

export { createValidationSchema }

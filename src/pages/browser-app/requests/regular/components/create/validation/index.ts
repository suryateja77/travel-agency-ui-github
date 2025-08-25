import { emailField, emptyField, numberFieldGreaterThanZero } from '@config/validation'
import { RegularRequestModel } from '@types'

const createValidationSchema = (regularRequestData: RegularRequestModel) => {
  const baseFields = [
    emptyField('customerType'),
    emptyField('vehicleType'),
    emptyField('staffType'),
    emptyField('requestType'),
    emptyField('pickUpLocation'),
    emptyField('dropOffLocation'),
    emptyField('pickUpDateTime'),
    emptyField('dropDateTime'),
    emptyField('openingKm'),
    numberFieldGreaterThanZero('openingKm'),
    emptyField('closingKm'),
    numberFieldGreaterThanZero('closingKm'),
    emptyField('packageCategory'),
    emptyField('package'),
    emptyField('paymentDetails.status'),
    emptyField('paymentDetails.paymentMethod'),
    emptyField('paymentDetails.paymentDate'),
  ]

  const conditionalFields = []

  // Customer type conditional fields
  if (regularRequestData.customerType === 'existing') {
    conditionalFields.push(
      emptyField('customerCategory'),
      emptyField('customer')
    )
  }

  if (regularRequestData.customerType === 'new' && regularRequestData.customerDetails) {
    conditionalFields.push(
      emptyField('customerDetails.name'),
      emptyField('customerDetails.contact')
    )
    // Email validation if provided
    if (regularRequestData.customerDetails.email) {
      conditionalFields.push(emailField('customerDetails.email'))
    }
  }

  // Vehicle type conditional fields
  if (regularRequestData.vehicleType === 'existing') {
    conditionalFields.push(
      emptyField('vehicleCategory'),
      emptyField('vehicle')
    )
  }

  if (regularRequestData.vehicleType === 'new' && regularRequestData.vehicleDetails) {
    conditionalFields.push(
      emptyField('vehicleDetails.ownerName'),
      emptyField('vehicleDetails.ownerContact'),
      emptyField('vehicleDetails.manufacturer'),
      emptyField('vehicleDetails.name'),
      emptyField('vehicleDetails.registrationNo')
    )
    // Email validation if provided
    if (regularRequestData.vehicleDetails.ownerEmail) {
      conditionalFields.push(emailField('vehicleDetails.ownerEmail'))
    }
  }

  // Staff type conditional fields
  if (regularRequestData.staffType === 'existing') {
    conditionalFields.push(
      emptyField('staffCategory'),
      emptyField('staff')
    )
  }

  if (regularRequestData.staffType === 'new' && regularRequestData.staffDetails) {
    conditionalFields.push(
      emptyField('staffDetails.name'),
      emptyField('staffDetails.contact'),
      emptyField('staffDetails.license')
    )
  }

  return [...baseFields, ...conditionalFields]
}

export { createValidationSchema }

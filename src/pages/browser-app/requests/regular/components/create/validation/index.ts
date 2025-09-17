import { emailField, emptyField, numberFieldGreaterThanZero, dateTimeGreaterThanField, numberGreaterThanField } from '@config/validation'
import { RegularRequestModel } from '@types'
import { nameToPath } from '@utils'

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
    dateTimeGreaterThanField('dropDateTime', 'pickUpDateTime', 'pick-up'),
    emptyField('openingKm'),
    numberFieldGreaterThanZero('openingKm'),
    emptyField('closingKm'),
    numberFieldGreaterThanZero('closingKm'),
    numberGreaterThanField('closingKm', 'openingKm', 'opening km'),
    emptyField('packageCategory'),
    emptyField('package'),
    emptyField('paymentDetails.status'),
    emptyField('paymentDetails.paymentMethod'),
    emptyField('paymentDetails.paymentDate'),
  ]

  const conditionalFields = []

  // Customer type conditional fields
  if (regularRequestData.customerType === 'existing') {
    conditionalFields.push(emptyField('customerCategory'), emptyField('customer'))
  }

  if (regularRequestData.customerType === 'new' && regularRequestData.customerDetails) {
    conditionalFields.push(emptyField('customerDetails.name'), emptyField('customerDetails.contact'))
    // Email validation if provided
    if (regularRequestData.customerDetails.email) {
      conditionalFields.push(emailField('customerDetails.email'))
    }
  }

  // Vehicle type conditional fields
  if (regularRequestData.vehicleType === 'existing') {
    conditionalFields.push(emptyField('vehicleCategory'), emptyField('vehicle'))
    if (regularRequestData.vehicleCategory && nameToPath(regularRequestData.vehicleCategory) === 'supplier') {
      conditionalFields.push(emptyField('supplier'), emptyField('supplierPackage'))
    }
  }

  if (regularRequestData.vehicleType === 'new' && regularRequestData.vehicleDetails) {
    conditionalFields.push(
      emptyField('vehicleDetails.ownerName'),
      emptyField('vehicleDetails.ownerContact'),
      emptyField('vehicleDetails.manufacturer'),
      emptyField('vehicleDetails.name'),
      emptyField('vehicleDetails.registrationNo'),
    )
    // Email validation if provided
    if (regularRequestData.vehicleDetails.ownerEmail) {
      conditionalFields.push(emailField('vehicleDetails.ownerEmail'))
    }
    // Provider package validation when vehicle type is new
    if (regularRequestData.packageFromProvidedVehicle) {
      conditionalFields.push(emptyField('packageFromProvidedVehicle.packageCategory'), emptyField('packageFromProvidedVehicle.packageId'))
    }
  }

  // Staff type conditional fields
  if (regularRequestData.staffType === 'existing') {
    conditionalFields.push(emptyField('staffCategory'), emptyField('staff'))
  }

  if (regularRequestData.staffType === 'new' && regularRequestData.staffDetails) {
    conditionalFields.push(emptyField('staffDetails.name'), emptyField('staffDetails.contact'), emptyField('staffDetails.license'))
  }

  return [...baseFields, ...conditionalFields]
}

const calculateTotalValidationSchema = [
  emptyField('pickUpDateTime'),
  emptyField('dropDateTime'),
  dateTimeGreaterThanField('dropDateTime', 'pickUpDateTime', 'pick-up'),
  emptyField('openingKm'),
  numberFieldGreaterThanZero('openingKm'),
  emptyField('closingKm'),
  numberFieldGreaterThanZero('closingKm'),
  numberGreaterThanField('closingKm', 'openingKm', 'opening km'),
]

export { createValidationSchema, calculateTotalValidationSchema }

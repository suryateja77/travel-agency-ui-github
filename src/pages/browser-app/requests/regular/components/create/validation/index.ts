import { emailField, emptyField, numberFieldGreaterThanZero, dateTimeGreaterThanField, numberGreaterThanField } from '@config/validation'
import { RegularRequestModel } from '@types'
import { nameToPath } from '@utils'

const createValidationSchema = (regularRequestData: RegularRequestModel) => {
  const baseFields = [
    // Package Details
    emptyField('packageDetails.packageCategory'),
    emptyField('packageDetails.package'),
    
    // Request Details
    emptyField('requestDetails.requestType'),
    emptyField('requestDetails.pickUpLocation'),
    emptyField('requestDetails.dropOffLocation'),
    emptyField('requestDetails.pickUpDateTime'),
    emptyField('requestDetails.dropDateTime'),
    dateTimeGreaterThanField('requestDetails.dropDateTime', 'requestDetails.pickUpDateTime', 'pick-up'),
    emptyField('requestDetails.openingKm'),
    numberFieldGreaterThanZero('requestDetails.openingKm'),
    emptyField('requestDetails.closingKm'),
    numberFieldGreaterThanZero('requestDetails.closingKm'),
    numberGreaterThanField('requestDetails.closingKm', 'requestDetails.openingKm', 'opening km'),
  ]

  const conditionalFields = []

  // Payment Details - only required when status is CLOSED
  if (regularRequestData.status === 'CLOSED') {
    conditionalFields.push(
      emptyField('paymentDetails.paymentMethod'),
      emptyField('paymentDetails.paymentDate')
    )
  }

  // Customer type conditional fields
  if (regularRequestData.customerDetails.customerType === 'existing') {
    conditionalFields.push(
      emptyField('customerDetails.customerCategory'),
      emptyField('customerDetails.customer')
    )
  }

  if (regularRequestData.customerDetails.customerType === 'new' && regularRequestData.customerDetails.newCustomerDetails) {
    conditionalFields.push(
      emptyField('customerDetails.newCustomerDetails.name'),
      emptyField('customerDetails.newCustomerDetails.contact')
    )
    // Email validation if provided
    if (regularRequestData.customerDetails.newCustomerDetails.email) {
      conditionalFields.push(emailField('customerDetails.newCustomerDetails.email'))
    }
  }

  // Vehicle type conditional fields
  if (regularRequestData.vehicleDetails.vehicleType === 'existing') {
    conditionalFields.push(
      emptyField('vehicleDetails.vehicleCategory'),
      emptyField('vehicleDetails.vehicle')
    )
    if (regularRequestData.vehicleDetails.vehicleCategory && nameToPath(regularRequestData.vehicleDetails.vehicleCategory) === 'supplier') {
      conditionalFields.push(
        emptyField('vehicleDetails.supplierDetails.supplier'),
        emptyField('vehicleDetails.supplierDetails.package')
      )
    }
  }

  if (regularRequestData.vehicleDetails.vehicleType === 'new' && regularRequestData.vehicleDetails.newVehicleDetails) {
    conditionalFields.push(
      emptyField('vehicleDetails.newVehicleDetails.ownerName'),
      emptyField('vehicleDetails.newVehicleDetails.ownerContact'),
      emptyField('vehicleDetails.newVehicleDetails.manufacturer'),
      emptyField('vehicleDetails.newVehicleDetails.name'),
      emptyField('vehicleDetails.newVehicleDetails.registrationNo')
    )
    // Email validation if provided
    if (regularRequestData.vehicleDetails.newVehicleDetails.ownerEmail) {
      conditionalFields.push(emailField('vehicleDetails.newVehicleDetails.ownerEmail'))
    }
    // Provider package validation when vehicle type is new
    if (regularRequestData.vehicleDetails.newVehicleDetails.package) {
      conditionalFields.push(emptyField('vehicleDetails.newVehicleDetails.package'))
    }
  }

  // Staff type conditional fields
  if (regularRequestData.staffDetails.staffType === 'existing') {
    conditionalFields.push(
      emptyField('staffDetails.staffCategory'),
      emptyField('staffDetails.staff')
    )
  }

  if (regularRequestData.staffDetails.staffType === 'new' && regularRequestData.staffDetails.newStaffDetails) {
    conditionalFields.push(
      emptyField('staffDetails.newStaffDetails.name'),
      emptyField('staffDetails.newStaffDetails.contact'),
      emptyField('staffDetails.newStaffDetails.license')
    )
  }

  return [...baseFields, ...conditionalFields]
}

const calculateTotalValidationSchema = (regularRequestData: RegularRequestModel) => {
  const baseFields = [
    emptyField('requestDetails.pickUpDateTime'),
    emptyField('requestDetails.dropDateTime'),
    dateTimeGreaterThanField('requestDetails.dropDateTime', 'requestDetails.pickUpDateTime', 'pick-up'),
    emptyField('requestDetails.openingKm'),
    numberFieldGreaterThanZero('requestDetails.openingKm'),
    emptyField('requestDetails.closingKm'),
    numberFieldGreaterThanZero('requestDetails.closingKm'),
    numberGreaterThanField('requestDetails.closingKm', 'requestDetails.openingKm', 'opening km'),
    emptyField('packageDetails.packageCategory'),
    emptyField('packageDetails.package'),
  ]

  const conditionalFields = []

  // Package validation based on vehicle type
  if (
    regularRequestData.vehicleDetails.vehicleType === 'existing' &&
    regularRequestData.vehicleDetails.vehicleCategory &&
    nameToPath(regularRequestData.vehicleDetails.vehicleCategory) === 'supplier'
  ) {
    conditionalFields.push(emptyField('vehicleDetails.supplierDetails.package'))
  }

  if (regularRequestData.vehicleDetails.vehicleType === 'new' && regularRequestData.vehicleDetails.newVehicleDetails?.package) {
    conditionalFields.push(emptyField('vehicleDetails.newVehicleDetails.package'))
  }

  return [...baseFields, ...conditionalFields]
}

export { createValidationSchema, calculateTotalValidationSchema }

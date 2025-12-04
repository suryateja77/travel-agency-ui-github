import { emptyField, numberFieldGreaterThanZero, dateTimeGreaterThanField, numberGreaterThanField } from '@config/validation'
import { MonthlyFixedRequestModel } from '@types'

const createValidationSchema = (monthlyFixedRequestData: MonthlyFixedRequestModel) => {
  const baseFields = [
    // Customer Details
    emptyField('customerDetails.customerCategory'),
    emptyField('customerDetails.customer'),
    
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

  const conditionalFields: any[] = []

  // Vehicle Details - Base field (always required)
  conditionalFields.push(emptyField('vehicleDetails.vehicleType'))

  // Vehicle Details - Conditional based on vehicleType
  if (monthlyFixedRequestData.vehicleDetails.vehicleType === 'existing') {
    conditionalFields.push(emptyField('vehicleDetails.vehicleCategory'))
    
    // If supplier category, require supplier and supplier-specific fields
    if (monthlyFixedRequestData.vehicleDetails.vehicleCategory && 
        monthlyFixedRequestData.vehicleDetails.vehicleCategory.toLowerCase().includes('supplier')) {
      conditionalFields.push(emptyField('vehicleDetails.supplierDetails.supplier'))
      conditionalFields.push(emptyField('vehicleDetails.vehicle'))
      conditionalFields.push(emptyField('vehicleDetails.supplierDetails.package'))
    } else {
      // Non-supplier category, only vehicle required
      conditionalFields.push(emptyField('vehicleDetails.vehicle'))
    }
  } else if (monthlyFixedRequestData.vehicleDetails.vehicleType === 'new') {
    // New vehicle requires all newVehicleDetails fields
    conditionalFields.push(emptyField('vehicleDetails.newVehicleDetails.ownerName'))
    conditionalFields.push(emptyField('vehicleDetails.newVehicleDetails.ownerContact'))
    conditionalFields.push(emptyField('vehicleDetails.newVehicleDetails.manufacturer'))
    conditionalFields.push(emptyField('vehicleDetails.newVehicleDetails.name'))
    conditionalFields.push(emptyField('vehicleDetails.newVehicleDetails.registrationNo'))
  }
  // Note: vehicleType 'regular' uses assigned vehicle, no additional validation needed

  // Staff Details - Base field (always required)
  conditionalFields.push(emptyField('staffDetails.staffType'))

  // Staff Details - Conditional based on staffType
  if (monthlyFixedRequestData.staffDetails.staffType === 'existing') {
    conditionalFields.push(emptyField('staffDetails.staffCategory'))
    conditionalFields.push(emptyField('staffDetails.staff'))
  } else if (monthlyFixedRequestData.staffDetails.staffType === 'new') {
    // New staff requires all newStaffDetails fields
    conditionalFields.push(emptyField('staffDetails.newStaffDetails.name'))
    conditionalFields.push(emptyField('staffDetails.newStaffDetails.contact'))
    conditionalFields.push(emptyField('staffDetails.newStaffDetails.license'))
  }
  // Note: staffType 'regular' uses assigned staff, no additional validation needed

  return [...baseFields, ...conditionalFields]
}

export { createValidationSchema }

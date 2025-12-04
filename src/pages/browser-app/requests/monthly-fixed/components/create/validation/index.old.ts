// import { emailField, emptyField, numberFieldGreaterThanZero, dateTimeGreaterThanField, numberGreaterThanField } from '@config/validation'
// import { MonthlyFixedRequestModel } from '@types'
// import { nameToPath } from '@utils'

// const createValidationSchema = (monthlyFixedRequestData: MonthlyFixedRequestModel) => {
//   const baseFields = [
//     // Customer Details - always required
//     emptyField('customerCategory'),
//     emptyField('customer'),

//     // Request Details - always required
//     emptyField('vehicleType'),
//     emptyField('staffType'),
//     emptyField('requestType'),
//     emptyField('pickUpLocation'),
//     emptyField('dropOffLocation'),
//     emptyField('pickUpDateTime'),
//     emptyField('dropDateTime'),
//     dateTimeGreaterThanField('dropDateTime', 'pickUpDateTime', 'pick-up'),
//     emptyField('openingKm'),
//     numberFieldGreaterThanZero('openingKm'),
//     emptyField('closingKm'),
//     numberFieldGreaterThanZero('closingKm'),
//     numberGreaterThanField('closingKm', 'openingKm', 'opening km'),
//   ]

//   const conditionalFields = []

//   // Vehicle selection conditional fields
//   if (monthlyFixedRequestData.vehicleType === 'own') {
//     conditionalFields.push(emptyField('vehicleCategory'), emptyField('vehicle'))
//   }

//   if (monthlyFixedRequestData.vehicleType === 'supplier') {
//     conditionalFields.push(emptyField('supplier'), emptyField('vehicle'), emptyField('supplierPackage'))
//   }

//   if (monthlyFixedRequestData.vehicleType === 'new' && monthlyFixedRequestData.vehicleDetails) {
//     conditionalFields.push(
//       emptyField('vehicleDetails.ownerName'),
//       emptyField('vehicleDetails.ownerContact'),
//       emptyField('vehicleDetails.manufacturer'),
//       emptyField('vehicleDetails.name'),
//       emptyField('vehicleDetails.registrationNo'),
//     )
//     // Email validation if provided
//     if (monthlyFixedRequestData.vehicleDetails.ownerEmail) {
//       conditionalFields.push(emailField('vehicleDetails.ownerEmail'))
//     }
//     // Provider package validation when vehicle selection is new
//     if (monthlyFixedRequestData.packageFromProvidedVehicle) {
//       conditionalFields.push(emptyField('packageFromProvidedVehicle.packageCategory'), emptyField('packageFromProvidedVehicle.packageId'))
//     }
//   }

//   // Staff selection conditional fields
//   if (monthlyFixedRequestData.staffType === 'own') {
//     conditionalFields.push(emptyField('staffCategory'), emptyField('staff'))
//   }

//   if (monthlyFixedRequestData.staffType === 'new' && monthlyFixedRequestData.staffDetails) {
//     conditionalFields.push(emptyField('staffDetails.name'), emptyField('staffDetails.contact'), emptyField('staffDetails.license'))
//   }

//   // Other charges validation - same as regular requests (amount fields are required if provided)
//   if (monthlyFixedRequestData.otherCharges.toll.amount && Number(monthlyFixedRequestData.otherCharges.toll.amount) > 0) {
//     conditionalFields.push(numberFieldGreaterThanZero('otherCharges.toll.amount'))
//   }

//   if (monthlyFixedRequestData.otherCharges.parking.amount && Number(monthlyFixedRequestData.otherCharges.parking.amount) > 0) {
//     conditionalFields.push(numberFieldGreaterThanZero('otherCharges.parking.amount'))
//   }

//   if (monthlyFixedRequestData.otherCharges.nightHalt.amount && Number(monthlyFixedRequestData.otherCharges.nightHalt.amount) > 0) {
//     conditionalFields.push(numberFieldGreaterThanZero('otherCharges.nightHalt.amount'))
//   }

//   if (monthlyFixedRequestData.otherCharges.driverAllowance.amount && Number(monthlyFixedRequestData.otherCharges.driverAllowance.amount) > 0) {
//     conditionalFields.push(numberFieldGreaterThanZero('otherCharges.driverAllowance.amount'))
//   }

//   return [...baseFields, ...conditionalFields]
// }

// const calculateTotalValidationSchema = (monthlyFixedRequestData: MonthlyFixedRequestModel) => {
//   const baseFields = [
//     emptyField('pickUpDateTime'),
//     emptyField('dropDateTime'),
//     dateTimeGreaterThanField('dropDateTime', 'pickUpDateTime', 'pick-up'),
//     emptyField('openingKm'),
//     numberFieldGreaterThanZero('openingKm'),
//     emptyField('closingKm'),
//     numberFieldGreaterThanZero('closingKm'),
//     numberGreaterThanField('closingKm', 'openingKm', 'opening km'),
//   ]

//   const conditionalFields = []

//   // Package validation based on vehicle selection
//   if (monthlyFixedRequestData.vehicleType === 'supplier') {
//     conditionalFields.push(emptyField('supplierPackage'))
//   }

//   if (monthlyFixedRequestData.vehicleType === 'new' && monthlyFixedRequestData.packageFromProvidedVehicle) {
//     conditionalFields.push(emptyField('packageFromProvidedVehicle.packageCategory'), emptyField('packageFromProvidedVehicle.packageId'))
//   }

//   return [...baseFields, ...conditionalFields]
// }

// export { createValidationSchema, calculateTotalValidationSchema }
// import { emailField, emptyField, numberFieldGreaterThanZero, dateTimeGreaterThanField, numberGreaterThanField } from '@config/validation'
// import { RegularRequestModel } from '@types'
// import { nameToPath } from '@utils'

// const createValidationSchema = (regularRequestData: RegularRequestModel) => {
//   const baseFields = [
//     emptyField('customerType'),
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
//     emptyField('packageCategory'),
//     emptyField('package'),
//     emptyField('paymentDetails.status'),
//     emptyField('paymentDetails.paymentMethod'),
//     emptyField('paymentDetails.paymentDate'),
//   ]

//   const conditionalFields = []

//   // Customer type conditional fields
//   if (regularRequestData.customerType === 'existing') {
//     conditionalFields.push(emptyField('customerCategory'), emptyField('customer'))
//   }

//   if (regularRequestData.customerType === 'new' && regularRequestData.customerDetails) {
//     conditionalFields.push(emptyField('customerDetails.name'), emptyField('customerDetails.contact'))
//     // Email validation if provided
//     if (regularRequestData.customerDetails.email) {
//       conditionalFields.push(emailField('customerDetails.email'))
//     }
//   }

//   // Vehicle type conditional fields
//   if (regularRequestData.vehicleType === 'existing') {
//     conditionalFields.push(emptyField('vehicleCategory'), emptyField('vehicle'))
//     if (regularRequestData.vehicleCategory && nameToPath(regularRequestData.vehicleCategory) === 'supplier') {
//       conditionalFields.push(emptyField('supplier'), emptyField('supplierPackage'))
//     }
//   }

//   if (regularRequestData.vehicleType === 'new' && regularRequestData.vehicleDetails) {
//     conditionalFields.push(
//       emptyField('vehicleDetails.ownerName'),
//       emptyField('vehicleDetails.ownerContact'),
//       emptyField('vehicleDetails.manufacturer'),
//       emptyField('vehicleDetails.name'),
//       emptyField('vehicleDetails.registrationNo'),
//     )
//     // Email validation if provided
//     if (regularRequestData.vehicleDetails.ownerEmail) {
//       conditionalFields.push(emailField('vehicleDetails.ownerEmail'))
//     }
//     // Provider package validation when vehicle type is new
//     if (regularRequestData.packageFromProvidedVehicle) {
//       conditionalFields.push(emptyField('packageFromProvidedVehicle.packageCategory'), emptyField('packageFromProvidedVehicle.package'))
//     }
//   }

//   // Staff type conditional fields
//   if (regularRequestData.staffType === 'existing') {
//     conditionalFields.push(emptyField('staffCategory'), emptyField('staff'))
//   }

//   if (regularRequestData.staffType === 'new' && regularRequestData.staffDetails) {
//     conditionalFields.push(emptyField('staffDetails.name'), emptyField('staffDetails.contact'), emptyField('staffDetails.license'))
//   }

//   // Advanced payment validation - custom logic with proper format
//   const advanceFromCustomerAmount = regularRequestData.advancedPayment?.advancedFromCustomer?.amount
//   if (advanceFromCustomerAmount && Number(advanceFromCustomerAmount) > 0) {
//     conditionalFields.push(
//       emptyField('advancedPayment.advancedFromCustomer.paymentMethod'),
//       emptyField('advancedPayment.advancedFromCustomer.paymentDate')
//     )
//   }

//   // Advanced to supplier validation (only when supplier vehicles)
//   if (regularRequestData.vehicleCategory && nameToPath(regularRequestData.vehicleCategory) === 'supplier') {
//     const advanceToSupplierAmount = regularRequestData.advancedPayment?.advancedToSupplier?.amount
//     if (advanceToSupplierAmount && Number(advanceToSupplierAmount) > 0) {
//       conditionalFields.push(
//         emptyField('advancedPayment.advancedToSupplier.paymentMethod'),
//         emptyField('advancedPayment.advancedToSupplier.paymentDate')
//       )
//     }
//   }

//   return [...baseFields, ...conditionalFields]
// }

// const calculateTotalValidationSchema = (regularRequestData: RegularRequestModel) => {
//   const baseFields = [
//     emptyField('pickUpDateTime'),
//     emptyField('dropDateTime'),
//     dateTimeGreaterThanField('dropDateTime', 'pickUpDateTime', 'pick-up'),
//     emptyField('openingKm'),
//     numberFieldGreaterThanZero('openingKm'),
//     emptyField('closingKm'),
//     numberFieldGreaterThanZero('closingKm'),
//     numberGreaterThanField('closingKm', 'openingKm', 'opening km'),
//     emptyField('packageCategory'),
//     emptyField('package'),
//   ]

//   const conditionalFields = []

//   // Package validation based on vehicle type
//   if (regularRequestData.vehicleType === 'existing' && regularRequestData.vehicleCategory && nameToPath(regularRequestData.vehicleCategory) === 'supplier') {
//     conditionalFields.push(emptyField('supplierPackage'))
//   }

//   if (regularRequestData.vehicleType === 'new' && regularRequestData.packageFromProvidedVehicle) {
//     conditionalFields.push(emptyField('packageFromProvidedVehicle.packageCategory'), emptyField('packageFromProvidedVehicle.package'))
//   }

//   return [...baseFields, ...conditionalFields]
// }

// export { createValidationSchema, calculateTotalValidationSchema }

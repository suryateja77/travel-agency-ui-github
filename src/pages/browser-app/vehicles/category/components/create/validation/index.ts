import { emailField, emptyField, numberFieldGreaterThanZero, registrationNoField } from '@config/validation'
import { VehicleModel } from '@types'

const createValidationSchema = (vehicleData: VehicleModel, category: string = '') => {
  const conditionalFields = vehicleData.isMonthlyFixed
    ? [
        emptyField('monthlyFixedDetails.customerCategory'),
        emptyField('monthlyFixedDetails.customer'),
        emptyField('monthlyFixedDetails.packageCategory'),
        emptyField('monthlyFixedDetails.package'),
        emptyField('monthlyFixedDetails.staffCategory'),
        emptyField('monthlyFixedDetails.staff'),
        emptyField('monthlyFixedDetails.contractStartDate'),
        emptyField('monthlyFixedDetails.contractEndDate'),
      ]
    : []

  const supplierField = category === 'supplier' ? [emptyField('supplier')] : []

  return [
    emptyField('type'),
    emptyField('manufacturer'),
    emptyField('name'),
    emptyField('noOfSeats'),
    numberFieldGreaterThanZero('noOfSeats'),
    emptyField('registrationNo'),
    registrationNoField('registrationNo'),
    emptyField('hasAc'),
    emptyField('isMonthlyFixed'),
    ...conditionalFields,
    ...supplierField,
  ]
}

export { createValidationSchema }

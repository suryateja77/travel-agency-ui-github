import { emailField, emptyField, numberFieldGreaterThanZero } from '@config/validation'
import { VehicleModel } from '@types'

const createValidationSchema = (vehicleData: VehicleModel) => {
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

  return [
    emptyField('type'),
    emptyField('manufacturer'),
    emptyField('name'),
    emptyField('noOfSeats'),
    numberFieldGreaterThanZero('noOfSeats'),
    emptyField('registrationNo'),
    emptyField('hasAc'),
    emptyField('isMonthlyFixed'),
    ...conditionalFields,
  ]
}

export { createValidationSchema }

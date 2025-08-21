import { emailField, emptyField, numberFieldGreaterThanZero } from '@config/validation'
import { VehicleModel } from '@types'

const createValidationSchema = (vehicleData: VehicleModel) => {
  const conditionalFields = vehicleData.vehicleDetails.isMonthlyFixed
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
    emptyField('vehicleDetails.vehicleType'),
    emptyField('vehicleDetails.manufacturer'),
    emptyField('vehicleDetails.name'),
    numberFieldGreaterThanZero('vehicleDetails.numberOfSeats'),
    emptyField('vehicleDetails.registrationNumber'),
    emptyField('vehicleDetails.isACRequired'),
    emptyField('vehicleDetails.isMonthlyFixed'),
    ...conditionalFields,
  ]
}

export { createValidationSchema }

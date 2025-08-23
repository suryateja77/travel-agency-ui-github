import { emailField, emptyField, numberFieldGreaterThanZero } from '@config/validation'
import { ExpenseModel } from '@types'

const createValidationSchema = (expenseData: ExpenseModel) => {
  const vehicleConditionalFields = expenseData.vehicleCategory
    ? [
        emptyField('vehicleCategory'),
        emptyField('vehicle'),
      ]
    : []

  const staffConditionalFields = expenseData.staffCategory
    ? [
        emptyField('staffCategory'),
        emptyField('staff'),
      ]
    : []

  return [
    emptyField('type'),
    emptyField('paymentMethod'),
    emptyField('date'),
    emptyField('amount'),
    numberFieldGreaterThanZero('amount'),
    emptyField('location'),
    ...vehicleConditionalFields,
    ...staffConditionalFields,
  ]
}

export { createValidationSchema }

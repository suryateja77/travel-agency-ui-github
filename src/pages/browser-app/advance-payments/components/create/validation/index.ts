import { emptyField, numberFieldGreaterThanZero } from '@config/validation'
import { AdvancePaymentModel } from '@types'

const createValidationSchema = (advancePaymentData: AdvancePaymentModel) => {
  return [
    emptyField('staffCategory'),
    emptyField('staff'),
    emptyField('paymentDate'),
    emptyField('paymentMethod'),
    emptyField('amount'),
    numberFieldGreaterThanZero('amount'),
  ]
}

export { createValidationSchema }

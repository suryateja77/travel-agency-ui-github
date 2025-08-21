import { emptyField, numberFieldGreaterThanZero } from '@config/validation'
import { PackageModel } from '@types'

const createValidationSchema = (packageData: PackageModel) => {
  return [
    emptyField('packageCode'),
    emptyField('minimumKm'),
    numberFieldGreaterThanZero('minimumKm'),
    emptyField('minimumHr'),
    numberFieldGreaterThanZero('minimumHr'),
    emptyField('baseAmount'),
    numberFieldGreaterThanZero('baseAmount'),
    emptyField('extraKmPerKmRate'),
    numberFieldGreaterThanZero('extraKmPerKmRate'),
    emptyField('extraHrPerHrRate'),
    numberFieldGreaterThanZero('extraHrPerHrRate'),
  ]
}

export { createValidationSchema }

import { emptyField, numberFieldGreaterThanZero } from '@config/validation'
import { PackageModel } from '@types'

const createValidationSchema = (packageData: PackageModel, category?: string) => {
  const baseFields = [
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

  const conditionalFields = []

  if (category === 'supplier') {
    conditionalFields.push(emptyField('supplier'))
  }

  return [...baseFields, ...conditionalFields]
}

export { createValidationSchema }

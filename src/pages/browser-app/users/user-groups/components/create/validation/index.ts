import { emptyField } from '@config/validation'
import { UserGroupModel } from '@types'

export const createValidationSchema = (data: UserGroupModel) => {
  return [
    emptyField('groupName'),
  ]
}

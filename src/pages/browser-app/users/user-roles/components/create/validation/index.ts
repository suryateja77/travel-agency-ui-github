import { emptyField } from '@config/validation'
import { UserRoleModel } from '@types'

export const createValidationSchema = (data: UserRoleModel) => {
  return [
    emptyField('roleName'),
  ]
}

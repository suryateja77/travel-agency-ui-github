import { emptyField, emailField } from '@config'

const validationSchema = [emptyField('email'), emailField('email'), emptyField('password')]

export default validationSchema

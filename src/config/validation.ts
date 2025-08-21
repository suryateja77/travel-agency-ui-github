import { REGEX_CONTACT, REGEX_EMAIL, REGEX_EMPTY, REGEX_NUMBER, REGEX_NUMBER_GREATER_THAN_ZERO, REGEX_PIN_CODE } from './constant'

const emptyField = (path: any) => ({
  path,
  pattern: REGEX_EMPTY,
  message: 'Required',
  emptyCheck: true,
})

const contactField = (path: any) => ({
  path,
  pattern: REGEX_CONTACT,
  message: 'Phone No must be 10 digits',
  emptyCheck: true,
})

const emailField = (path: any) => ({
  path,
  pattern: REGEX_EMAIL,
  message: 'Enter the valid e-mail',
  emptyCheck: true,
})

const numberField = (path: any) => ({
  path,
  pattern: REGEX_NUMBER,
  message: 'Enter the valid number ',
  emptyCheck: true,
})

const numberFieldGreaterThanZero = (path: any) => ({
  path,
  pattern: REGEX_NUMBER_GREATER_THAN_ZERO,
  message: 'Must be greater than zero',
  emptyCheck: true,
})

const pinCodeField = (path: any) => ({
  path,
  pattern: REGEX_PIN_CODE,
  message: 'Enter the valid Pin Code',
  emptyCheck: true,
})

export { emptyField, contactField, emailField, numberField, numberFieldGreaterThanZero, pinCodeField }

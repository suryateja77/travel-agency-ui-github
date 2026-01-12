import React, { FormEvent, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

import { bemClass, validatePayload } from '@utils'

import Alert from '@base/alert'
import Button from '@base/button'
import TextInput from '@base/text-input'
import Panel from '@base/panel'
import Row from '@base/row'
import Column from '@base/column'
import Text from '@base/text'

import AuthenticationWrapper from '@components/authentication-wrapper'

import { ClientRegistrationModel, INITIAL_CLIENT_REGISTRATION } from '@types'
import { useRegisterClientMutation } from '@api/queries/client'
import { useToast } from '@contexts/ToastContext'

import './style.scss'
import createValidationSchema from './validation'

const blk = 'register'

const Register = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [formData, setFormData] = useState<ClientRegistrationModel>(INITIAL_CLIENT_REGISTRATION)
  const [formErrorMap, setFormErrorMap] = useState<Record<string, any>>({})
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isValidationError, setIsValidationError] = useState(false)

  const registerClientMutation = useRegisterClientMutation()

  const changeHandler = (field: string, value: any) => {
    // Handle nested field updates
    const keys = field.split('.')

    if (keys.length === 1) {
      setFormData({ ...formData, [field]: value })
    } else if (keys.length === 2) {
      setFormData({
        ...formData,
        [keys[0]]: {
          ...(formData[keys[0] as keyof ClientRegistrationModel] as any),
          [keys[1]]: value,
        },
      })
    }

    // Clear error for this field
    if (formErrorMap[field]) {
      setFormErrorMap({ ...formErrorMap, [field]: undefined })
    }
  }

  const submitHandler = async (e: FormEvent) => {
    e.preventDefault()
    setIsValidationError(false)
    setErrorMessage('')

    // Validate form data
    const schema = createValidationSchema(formData)
    const { isValid, errorMap } = validatePayload(schema, formData)
    setFormErrorMap(errorMap)

    if (!isValid) {
      setIsValidationError(true)
      setErrorMessage('Please fill all required fields correctly.')
      return
    }

    setIsLoading(true)

    try {
      // Exclude confirmPassword from API request
      const { confirmPassword, ...registrationData } = formData
      await registerClientMutation.mutateAsync(registrationData)
      showToast('Agency registered successfully! You can now login with your credentials.', 'success')
      navigate('/login')
    } catch (error: any) {
      console.log('Unable to register agency', error)
      const errorMsg = error.response?.data?.message || 'Unable to register agency. Please try again.'
      showToast(errorMsg, 'error')
      setErrorMessage(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthenticationWrapper
      title="Register Your Agency"
      subTitle="Enter your agency details below"
      errorMessage={errorMessage}
    >
      <>
        {isValidationError && (
          <Alert
            type="error"
            message="Please fill all required fields correctly."
            className={bemClass([blk, 'margin-bottom'])}
          />
        )}

        <form
          onSubmit={submitHandler}
          className={bemClass([blk])}
        >
          <div className={bemClass([blk, 'content'])}>
            {/* Agency Details Panel */}
            <Panel
              title="Agency Details"
              className={bemClass([blk, 'panel'])}
            >
              <Row>
                <Column col={12}>
                  <TextInput
                    label="Agency Name"
                    name="agencyName"
                    value={formData.agencyName}
                    changeHandler={value => changeHandler('agencyName', value.agencyName)}
                    invalid={!!formErrorMap.agencyName}
                    errorMessage={formErrorMap.agencyName}
                    required
                    className={bemClass([blk, 'margin-bottom'])}
                  />
                </Column>
              </Row>
              <Row>
                <Column col={12}>
                  <TextInput
                    label="Contact Number"
                    name="contactNumber"
                    value={formData.contactNumber}
                    changeHandler={value => changeHandler('contactNumber', value.contactNumber)}
                    invalid={!!formErrorMap.contactNumber}
                    errorMessage={formErrorMap.contactNumber}
                    required
                    className={bemClass([blk, 'margin-bottom'])}
                  />
                </Column>
              </Row>
              <Row>
                <Column col={12}>
                  <TextInput
                    type="email"
                    label="Email"
                    name="email"
                    value={formData.email}
                    changeHandler={value => changeHandler('email', value.email)}
                    invalid={!!formErrorMap.email}
                    errorMessage={formErrorMap.email}
                    required
                    className={bemClass([blk, 'margin-bottom'])}
                  />
                </Column>
              </Row>
            </Panel>

            {/* Point of Contact Panel */}
            <Panel
              title="Point of Contact"
              className={bemClass([blk, 'panel'])}
            >
              <Row>
                <Column col={12}>
                  <TextInput
                    label="Name"
                    name="pointOfContact.name"
                    value={formData.pointOfContact.name}
                    changeHandler={value => changeHandler('pointOfContact.name', value['pointOfContact.name'])}
                    invalid={!!formErrorMap['pointOfContact.name']}
                    errorMessage={formErrorMap['pointOfContact.name']}
                    required
                    className={bemClass([blk, 'margin-bottom'])}
                  />
                </Column>
              </Row>
              <Row>
                <Column col={12}>
                  <TextInput
                    label="Designation"
                    name="pointOfContact.designation"
                    value={formData.pointOfContact.designation}
                    changeHandler={value => changeHandler('pointOfContact.designation', value['pointOfContact.designation'])}
                    invalid={!!formErrorMap['pointOfContact.designation']}
                    errorMessage={formErrorMap['pointOfContact.designation']}
                    required
                    className={bemClass([blk, 'margin-bottom'])}
                  />
                </Column>
              </Row>
              <Row>
                <Column col={12}>
                  <TextInput
                    label="Contact Number"
                    name="pointOfContact.contactNumber"
                    value={formData.pointOfContact.contactNumber}
                    changeHandler={value => changeHandler('pointOfContact.contactNumber', value['pointOfContact.contactNumber'])}
                    invalid={!!formErrorMap['pointOfContact.contactNumber']}
                    errorMessage={formErrorMap['pointOfContact.contactNumber']}
                    required
                    className={bemClass([blk, 'margin-bottom'])}
                  />
                </Column>
              </Row>
              <Row>
                <Column col={12}>
                  <TextInput
                    type="email"
                    label="Email"
                    name="pointOfContact.email"
                    value={formData.pointOfContact.email}
                    changeHandler={value => changeHandler('pointOfContact.email', value['pointOfContact.email'])}
                    invalid={!!formErrorMap['pointOfContact.email']}
                    errorMessage={formErrorMap['pointOfContact.email']}
                    required
                    className={bemClass([blk, 'margin-bottom'])}
                  />
                </Column>
              </Row>
            </Panel>

            {/* Address Panel */}
            <Panel
              title="Address"
              className={bemClass([blk, 'panel'])}
            >
              <Row>
                <Column col={12}>
                  <TextInput
                    label="Address Line 1"
                    name="address.addressLine1"
                    value={formData.address.addressLine1}
                    changeHandler={value => changeHandler('address.addressLine1', value['address.addressLine1'])}
                    invalid={!!formErrorMap['address.addressLine1']}
                    errorMessage={formErrorMap['address.addressLine1']}
                    required
                    className={bemClass([blk, 'margin-bottom'])}
                  />
                </Column>
              </Row>
              <Row>
                <Column col={12}>
                  <TextInput
                    label="Address Line 2"
                    name="address.addressLine2"
                    value={formData.address.addressLine2}
                    changeHandler={value => changeHandler('address.addressLine2', value['address.addressLine2'])}
                    className={bemClass([blk, 'margin-bottom'])}
                  />
                </Column>
              </Row>
              <Row>
                <Column col={12}>
                  <TextInput
                    label="City"
                    name="address.city"
                    value={formData.address.city}
                    changeHandler={value => changeHandler('address.city', value['address.city'])}
                    invalid={!!formErrorMap['address.city']}
                    errorMessage={formErrorMap['address.city']}
                    required
                    className={bemClass([blk, 'margin-bottom'])}
                  />
                </Column>
              </Row>
              <Row>
                <Column col={12}>
                  <TextInput
                    label="State"
                    name="address.state"
                    value={formData.address.state}
                    changeHandler={value => changeHandler('address.state', value['address.state'])}
                    invalid={!!formErrorMap['address.state']}
                    errorMessage={formErrorMap['address.state']}
                    required
                    className={bemClass([blk, 'margin-bottom'])}
                  />
                </Column>
              </Row>
              <Row>
                <Column col={12}>
                  <TextInput
                    label="Pin Code"
                    name="address.pinCode"
                    value={formData.address.pinCode}
                    changeHandler={value => changeHandler('address.pinCode', value['address.pinCode'])}
                    invalid={!!formErrorMap['address.pinCode']}
                    errorMessage={formErrorMap['address.pinCode']}
                    required
                    className={bemClass([blk, 'margin-bottom'])}
                  />
                </Column>
              </Row>
            </Panel>

            {/* Password Panel */}
            <Panel
              title="Set Password"
              className={bemClass([blk, 'panel'])}
            >
              <Row>
                <Column col={12}>
                  <TextInput
                    type="password"
                    label="Password"
                    name="password"
                    value={formData.password}
                    changeHandler={value => changeHandler('password', value.password)}
                    invalid={!!formErrorMap.password}
                    errorMessage={formErrorMap.password}
                    required
                    className={bemClass([blk, 'margin-bottom'])}
                  />
                </Column>
              </Row>
              <Row>
                <Column col={12}>
                  <TextInput
                    type="password"
                    label="Confirm Password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    changeHandler={value => changeHandler('confirmPassword', value.confirmPassword)}
                    invalid={!!formErrorMap.confirmPassword}
                    errorMessage={formErrorMap.confirmPassword}
                    required
                    className={bemClass([blk, 'margin-bottom'])}
                  />
                </Column>
              </Row>
            </Panel>
          </div>

          {/* Action Buttons */}
          <div className={bemClass([blk, 'action-items'])}>
            <Button
              type="submit"
              size="medium"
              loading={isLoading}
              category="success"
            >
              Register
            </Button>
          </div>
        </form>

        <div className={bemClass([blk, 'login-link'])}>
          <Text
            tag="p"
            typography="s"
            color="gray-darker"
          >
            <>
              Already have an account?{' '}
              <NavLink
                to="/login"
                className={bemClass([blk, 'login-link-text'])}
              >
                Login here
              </NavLink>
            </>
          </Text>
        </div>
      </>
    </AuthenticationWrapper>
  )
}

export default Register

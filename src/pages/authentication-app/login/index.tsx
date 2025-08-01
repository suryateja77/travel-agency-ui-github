import React, { FormEvent, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

import { bemClass, validatePayload } from '@utils'
import { setStorageItem } from '@utils/storage'

// import { Alert, Button, TextInput } from '@base'

import Alert from '@base/alert'
import Link from '@base/link'
import Button from '@base/button'
import TextInput from '@base/text-input'

import { useAuthenticateUserMutation } from '@api/queries/user'

import AuthenticationWrapper from '@components/authentication-wrapper'

// @ts-expect-error : do it later
import validationSchema from './validation/schema'

import './style.scss'
import Text from '@base/text'
import { LOGIN_ERROR_CODES } from '@config/error-codes'
import { AxiosError } from 'axios'

const blk = 'login'

const Login = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<Record<string, any>>({
    email: '',
    password: '',
  })
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isFormInInValid, setIsFormInValid] = useState(false)
  const [formErrorMap, setFormErrorMap] = useState<Record<string, any>>({})

  const { mutateAsync: authenticateUser } = useAuthenticateUserMutation()

  const changeHandler = (valueObj: { [arg: string]: string | number }) => {
    const updatedFormData = {
      ...formData,
      ...valueObj,
    }
    setFormData(updatedFormData)
  }

  const submitForm = async () => {
    const reqBody = { email, password }
    try {
      await authenticateUser(reqBody)
      setStorageItem('session', 'isLoggedIn', 'true')
      window.location.replace('/')
    } catch (error: any) {
      console.log(error)
      const { code } = error.response?.data || {}
      setIsFormInValid(true)
      setIsLoading(false)
      const errorInfo = LOGIN_ERROR_CODES.find(errorCode => errorCode.code === code)
      setErrorMessage(errorInfo ? errorInfo.message : 'Something went wrong')
    }
  }

  const submitHandler = (e: FormEvent) => {
    e.preventDefault()
    setIsFormInValid(false)
    const { isValid, errorMap } = validatePayload(validationSchema, formData)

    setFormErrorMap(errorMap)

    if (!isValid) {
      setIsFormInValid(true)
      setErrorMessage('Please fill the required fields.')
      return
    }

    setIsFormInValid(false)
    setIsLoading(true)
    submitForm()
  }

  const { email, password } = formData

  return (
    <AuthenticationWrapper
      title="Login to Travel Agency"
      subTitle="Enter your details below"
      errorMessage={errorMessage}
    >
      <>
        <form onSubmit={submitHandler}>
          <TextInput
            name="email"
            label="Email"
            value={email}
            invalid={!!formErrorMap.email}
            errorMessage={formErrorMap.email}
            changeHandler={changeHandler}
            className={bemClass([blk, 'margin-bottom'])}
          />
          <div className={bemClass([blk, 'password-label'])}>
            <Text
              tag="p"
              typography="s"
              color="gray-darker"
            >
              Password
            </Text>
            <NavLink
              to="/forgot-password"
              className={bemClass([blk, 'forgot-password'])}
            >
              Forgot Password?
            </NavLink>
          </div>
          <TextInput
            type="password"
            name="password"
            value={password}
            invalid={!!formErrorMap.password}
            changeHandler={changeHandler}
            className={bemClass([blk, 'margin-bottom'])}
          />

          <Button
            type="submit"
            size="medium"
            loading={isLoading}
            category="success"
          >
            Login
          </Button>
        </form>
      </>
    </AuthenticationWrapper>
  )
}

export default Login

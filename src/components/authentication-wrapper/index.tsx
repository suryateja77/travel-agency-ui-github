import React, { ReactElement } from 'react'

import Text from '@base/text'

import { bemClass } from '@utils'
import AuthBox from '../auth-box'

import './style.scss'
import Icon from '@base/icon'

type authenticationWrapperProps = {
  title: string
  subTitle: string
  children: ReactElement
  className?: string
  errorMessage: string
}

const blk = 'authentication-wrapper'

const AuthenticationWrapper = ({ title, subTitle, children, className, errorMessage }: authenticationWrapperProps) => (
  <AuthBox className={className}>
    <>
      <div className={bemClass([blk, 'header'])}>
        <Text
          tag="h2"
          typography="xxxxxl"
          fontWeight="normal"
          color="gray-darker"
          className={bemClass([blk, 'title'])}
        >
          {title}
        </Text>
        {errorMessage ? (
          <div className={bemClass([blk, 'error-section'])}>
            <Icon
              color="error"
              name="exclamation-triangle"
              className={bemClass([blk, 'error-icon'])}
            />
            <Text
              tag="p"
              typography="s"
              color="error"
            >
              {errorMessage}
            </Text>
          </div>
        ) : (
          <Text
            tag="p"
            typography="s"
            className={bemClass([blk, 'sub-title'])}
          >
            {subTitle}
          </Text>
        )}
      </div>
      {children}
    </>
  </AuthBox>
)

export default AuthenticationWrapper

import React, { memo, ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

import { bemClass } from '@utils/'

import './style.scss'
import Icon from '@base/icon'

export interface ButtonProps {
  children: ReactNode
  type?: 'button' | 'submit' | 'reset' | undefined
  size?: 'small' | 'medium' | 'large'
  category?:
    | 'primary'
    | 'primary-outline'
    | 'success'
    | 'success-outline'
    | 'error'
    | 'error-outline'
    | 'default'
    | 'default-outline'
    | 'warning'
    | 'warning-outline'
    | 'info'
    | 'info-outline'
  disabled?: boolean
  loading?: boolean
  isBlock?: boolean
  asAnchor?: boolean
  rounded?: boolean
  asLink?: boolean
  href?: string
  className?: string
  clickHandler?: (e?: any) => void
}

const blk = 'button'

const Button = ({
  children,
  type = 'button',
  size = 'small',
  category = 'primary',
  className = '',
  disabled = false,
  asLink = false,
  asAnchor = false,
  rounded = false,
  href = '/',
  isBlock = false,
  loading = false,
  clickHandler = () => {},
}: ButtonProps) => {
  const eltClassName = bemClass([
    blk,
    {
      [category]: category,
      [`${category}-loading`]: loading,
      rounded: rounded,
      [size]: size,
      loading,
      link: asAnchor || asLink,
      block: isBlock,
      disabled,
    },
    className,
  ])

  const loadingClass = bemClass([
    blk,
    'loading',
    {
      [category]: category,
    },
  ])

  if (asLink) {
    return (
      <NavLink
        to={href}
        className={eltClassName}
      >
        {children}
      </NavLink>
    )
  }

  if (asAnchor) {
    return (
      <a
        href={href}
        className={eltClassName}
      >
        {children}
      </a>
    )
  }

  return (
    <button
      type={type}
      className={eltClassName}
      disabled={disabled}
      onClick={clickHandler}
    >
      {loading && (
        <Icon
          name="spinner"
          size="16"
          spin
          className={loadingClass}
        />
      )}
      {children}
    </button>
  )
}

export default memo(Button)

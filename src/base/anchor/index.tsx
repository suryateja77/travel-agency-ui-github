import React, { FunctionComponent, ReactNode } from 'react'

import './style.scss'
import { bemClass } from '@utils'
import { NavLink } from 'react-router-dom'

interface AnchorProps {
  children: ReactNode
  href?: string
  className?: string
  color?: 'primary' | 'default' | 'success' | 'info' | 'error' | 'warning' | 'gray'
  title?: string
  asButton?: boolean
  type?: 'button' | 'submit' | 'reset'
  asLink?: boolean
  block?: boolean
  noUnderline?: boolean
  clickHandler?: () => void
  attributes?: {
    name: string
  }
}

const blk = 'anchor'

const Anchor: FunctionComponent<AnchorProps> = ({
  children,
  className = '',
  href = '/',
  color = 'primary',
  title = '',
  asButton = false,
  type = 'button',
  asLink = false,
  block = false,
  noUnderline = false,
  clickHandler = () => {},
  attributes = {},
}) => {
  const eltClass = bemClass([
    blk,
    {
      [color]: !!color,
      asButton: asButton,
      noUnderline: noUnderline,
      block: block,
    },
    className,
  ])
  if (asButton) {
    return (
      <button
        type={type}
        onClick={clickHandler}
        className={eltClass}
        {...attributes}
      >
        {children}
      </button>
    )
  }
  if (asLink) {
    return (
      <NavLink
        to={href}
        {...attributes}
        className={eltClass}
      >
        {children}
      </NavLink>
    )
  }
  return (
    <a
      href={href}
      title={title}
      {...attributes}
      className={eltClass}
    >
      {children}
    </a>
  )
}

export default Anchor

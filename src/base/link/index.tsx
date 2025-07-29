import React, { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

import { bemClass } from '@utils'

import './style.scss'

type linkProps = {
  children: ReactNode
  href?: string
  asButton?: boolean
  underline?: boolean
  clickHandler?: () => void
  className?: string
}

const blk = 'link'

const Link = ({ children, href = '/', asButton, underline, clickHandler, className }: linkProps) => {
  const eltClassName = bemClass([blk, { underline }, className])

  if (asButton) {
    return (
      <button
        type="button"
        className={eltClassName}
        onClick={clickHandler}
      >
        {children}
      </button>
    )
  }

  return (
    <NavLink
      to={href}
      className={eltClassName}
    >
      {children}
    </NavLink>
  )
}

export default Link

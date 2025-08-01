import React, { ReactNode } from 'react'

import { bemClass } from '@utils'

import './style.scss'

type authBoxProps = {
  children: ReactNode | ReactNode[]
  className?: string
  isCenter?: boolean
}

const blk = 'auth-box'

const AuthBox = ({ children, isCenter = false, className }: authBoxProps) => (
  <div className={blk}>
    <div className={bemClass([blk, 'box', { center: isCenter }, className])}>{children}</div>
  </div>
)

export default AuthBox

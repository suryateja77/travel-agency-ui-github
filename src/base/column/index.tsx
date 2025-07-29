import React, { ReactNode } from 'react'

import { bemClass } from '@utils'

import './style.scss'

type columnProps = {
  children: ReactNode
  col: number
  className?: string
}

const blk = 'column'

const Column = ({ children, col, className }: columnProps) => {
  const eltClass = bemClass([
    blk,
    {
      [col]: !!col,
    },
    className,
  ])

  return <div className={eltClass}>{children}</div>
}

export default Column

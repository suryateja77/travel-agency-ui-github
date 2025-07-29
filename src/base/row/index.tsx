import React, { ReactNode } from 'react'

import { bemClass } from '@utils'

type rowProps = {
  children: ReactNode
  className?: string
}

import './style.scss'

const blk = 'row'

const Row = ({ children, className }: rowProps) => <div className={bemClass([blk, {}, className])}>{children}</div>

export default Row

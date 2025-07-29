import React from 'react'
import { bemClass } from '@utils'

import './style.scss'

const blk = 'spinner'

type spinnerProps = {
  category?: 'primary' | 'secondary' | 'default'
  size?: 'small' | 'medium' | 'large'
  className?: string
}

const Spinner = ({ category = 'primary', size = 'medium', className }: spinnerProps) => {
  const eltClassName = bemClass([
    blk,
    {
      [category]: category,
      [size]: size,
    },
    className,
  ])
  return <div className={eltClassName} />
}

export default Spinner

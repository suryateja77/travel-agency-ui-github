import React, { ReactNode } from 'react'

import { bemClass } from '@utils'

import './style.scss'
import Icon from '@base/icon'
import Text from '@base/text'

type alertProps = {
  type: 'success' | 'warning' | 'info' | 'error'
  message: string
  className?: string
}

const blk = 'alert'

const Alert = ({ type, message, className }: alertProps) => {
  const eltClass = bemClass([
    blk,
    {
      [type]: type,
    },
    className,
  ])
  const iconMap = {
    error: 'exclamation-triangle',
    success: 'check-circle',
    info: 'info-circle',
    warning: 'exclamation-circle',
  }
  return (
    <div className={eltClass}>
      <Icon
        name={iconMap[type]}
        size="22"
        color='white'
        className={bemClass([blk, 'icon'])}
      />
      <Text
        tag="span"
        fontWeight="normal"
        color='white'
        className={bemClass([blk, 'text'])}
      >
        {message}
      </Text>
    </div>
  )
}

export default Alert

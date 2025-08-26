import React from 'react'

import { bemClass } from '@utils'

import './style.scss'
import Text from '@base/text'

const blk = 'read-only-text'

interface ReadOnlyTextProps {
  label?: string
  value?: string | number
  size?: 'small' | 'large' | 'extra-large' | 'jumbo'
  color?: 'black' | 'gray-darker' | 'gray-dark' | 'gray' | 'gray-light' | 'white' | 'primary' | 'secondary' | 'warning' | 'success' | 'error'
  required?: boolean
  className?: string
  controlClasses?: string
}

const ReadOnlyText = (props: ReadOnlyTextProps) => {
  const {
    label = '',
    value = '',
    size = '',
    color = 'gray-darker',
    required = false,
    className = '',
    controlClasses = '',
  } = props

  const eltClass = bemClass([blk, {}, className])

  const textFieldClass = bemClass([
    blk,
    'textField',
    {
      [size]: size,
    },
    controlClasses,
  ])

  return (
    <div className={eltClass}>
      <div className={bemClass([blk, 'label-container'])}>
        {label && (
          <label className={bemClass([blk, 'label'])}>
            {label}
            {required && <span className={bemClass([blk, 'star'])}>*</span>}
          </label>
        )}
      </div>

      <div className={textFieldClass}>
        <Text color={color} typography="s">
          {value}
        </Text>
      </div>
    </div>
  )
}

export default ReadOnlyText

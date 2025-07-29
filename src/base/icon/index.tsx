import { bemClass } from '@utils'
import React, { ElementType, FunctionComponent } from 'react'

import './style.scss'

interface IconProps {
  name: string
  className?: string
  tag?: ElementType
  color?: 'primary' | 'default' | 'success' | 'info' | 'error' | 'warning' | 'white'
  size?: '8' | '14' | '16' | '22' | '30'
  attributes?: object
  iconScale?: string
  spin?: boolean
}

const blk = 'icon'

const Icon: FunctionComponent<IconProps> = ({ name, attributes = {}, className = '', color = 'gray', iconScale = '1x', size = '14', tag: Tag = 'span', spin = false }) => {
  const eltClass = bemClass([
    blk,
    {
      [color]: !!color,
      [size]: !!size,
    },
    className,
  ])
  const iconClass = `fa ${name ? 'fa-' + name : ''} ${spin ? 'fa-spin' : ''} ${iconScale ? 'fa-' + iconScale : ''}`
  return (
    <Tag
      className={eltClass}
      {...attributes}
    >
      <i className={iconClass} />
    </Tag>
  )
}

export default Icon

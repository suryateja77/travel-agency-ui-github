import React, { ElementType, HTMLAttributes, memo, ReactElement } from 'react'

import { bemClass } from '@utils'

import './style.scss'

const blk = 'text'

export interface TextProps extends HTMLAttributes<HTMLOrSVGElement> {
  tag?: ElementType
  children: ReactElement | ReactElement[] | string | number | null | undefined
  transform?: string,
  typography?: 'xxxs' |'xxs' | 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl' | 'xxxl' | 'xxxxl' | 'xxxxxl'
  fontWeight?: 'thinnest' | 'thin' | 'normal' | 'semi-bold' | 'bold'
  color?: 'black' | 'gray-darker' | 'gray-dark' | 'gray' | 'gray-light' | 'white' | 'primary' | 'secondary' | 'warning' | "success" | 'error'
  className?: string
  onClick?: () => void
}

const Text = ({ tag: Tag = 'span', children, typography = "s", fontWeight = 'normal', color = 'gray-dark', className = '', onClick, transform = 'none' }: TextProps) => {
  const eltClass = bemClass([
    blk,
    {
      [transform]: transform,
      [color]: !!color,
      [fontWeight]: !!fontWeight,
      [typography]: !!typography,
    },
    className,
  ])

  return <Tag onClick={onClick} className={eltClass}>{children}</Tag>
}

export default memo(Text)

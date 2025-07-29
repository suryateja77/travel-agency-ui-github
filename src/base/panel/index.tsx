import React, { ReactNode } from 'react'
import { bemClass } from '@utils'

import Text from '../text'

import './style.scss'

type panelProps = {
  title: string
  children: ReactNode
  className?: string
  contentClassName?: string
}

const blk = 'panel'

const Panel = ({ title, children, className, contentClassName }: panelProps) => (
  <div className={bemClass([blk, {}, className])}>
    <div className={bemClass([blk, 'header'])}>
      <Text
        tag="div"
        typography="m"
      >
        {title}
      </Text>
    </div>
    {children}
  </div>
)

export default Panel

import React, { ReactElement, ReactPortal } from 'react'

import { bemClass } from '@utils'

import './style.scss'

interface containerProps {
  children: string | number | ReactElement | ReactElement[] | ReactPortal | boolean | null | undefined
  fluid?: boolean
  className?: string
}

const blk = 'page-container'

const Container = ({ children, fluid, className }: containerProps) => <div className={bemClass([blk, { fluid }, className])}>{children}</div>

export default Container

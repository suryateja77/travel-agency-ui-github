import React, { FunctionComponent } from 'react'
import { bemClass } from '@utils'

const blk = 'header-cell'

import './style.scss'

interface HeaderCellProps {
  label?: string
  className?: string
}

const HeaderCell: FunctionComponent<HeaderCellProps> = ({ label = '', className = '' }) => {
  const eltClass = bemClass([blk, {}, className])
  return <th className={eltClass}>{label}</th>
}

export default HeaderCell

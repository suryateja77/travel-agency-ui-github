import React, { FunctionComponent, ReactNode } from 'react'
import { bemClass, computeValue } from '@utils'

const blk = 'table-cell'

import './style.scss'

interface TableCellProps {
  column: {
    custom?: (arg: any) => any
    map?: string
    className?: string
  }
  item: any
}

const TableCell: FunctionComponent<TableCellProps> = ({ column, item }) => {
  const { custom, map = '', className } = column
  const eltClass = bemClass([blk, {}, className])
  if (custom) {
    return <td className={eltClass}>{custom(item)}</td>
  }
  return <td className={eltClass}>{computeValue(item, map)}</td>
}

export default TableCell

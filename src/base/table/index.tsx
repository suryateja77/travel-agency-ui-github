import React, { Fragment, FunctionComponent } from 'react'
import HeaderCell from './components/header-cell'
import Spinner from '@base/spinner'
import TableCell from './components/table-cell'

import './style.scss'
import { bemClass } from '@utils'

const blk = 'table'

type Column = {
  custom?: (arg: any) => any
  map?: string
  className?: string
  label?: string
}

interface TableProps {
  columns?: Array<Column>
  isLoading?: boolean
  data?: Array<any>
  className?: string
  hoverEffect?: boolean
}

const Table: FunctionComponent<TableProps> = ({ columns = [], isLoading = false, data = [], className = '', hoverEffect = false }) => {
  const eltName = bemClass([
    blk,
    {
      hover: hoverEffect,
    },
    className,
  ])
  return (
    <table className={eltName}>
      <thead>
        <tr>
          {columns.map((column, index) => (
            <HeaderCell
              key={index}
              className={column.className}
              label={column.label}
            />
          ))}
        </tr>
      </thead>
      <tbody>
        {isLoading && (
          <tr>
            <td
              colSpan={columns.length}
              className={bemClass([blk, 'loading'])}
            >
              <Spinner size="small" />
            </td>
          </tr>
        )}
        {!isLoading && data.length === 0 && (
          <tr>
            <td
              colSpan={columns.length}
              className={bemClass([blk, 'no-record'])}
            >
              No record found.
            </td>
          </tr>
        )}
        {!isLoading &&
          data.map((item, index) => (
            <Fragment key={index}>
              <tr>
                {columns.map((column, index) => (
                  <TableCell
                    key={index}
                    item={item}
                    column={column}
                  />
                ))}
              </tr>
            </Fragment>
          ))}
      </tbody>
    </table>
  )
}

export default Table

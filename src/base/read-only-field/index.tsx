import Text from '@base/text'
import { bemClass } from '@utils'
import React, { FunctionComponent } from 'react'

import './style.scss'

const blk = 'read-only-field'

interface ReadOnlyFieldProps {
  value: string
  label: string
}

const ReadOnlyField: FunctionComponent<ReadOnlyFieldProps> = ({ value, label }) => {
  return (
    <div className={bemClass([blk])}>
      <Text typography='m' color='gray-darker'>{`${label}:`}</Text>
      <Text typography='l' color='gray-dark' className={bemClass([blk, 'value'])}>{value}</Text>
    </div>
  )
}

export default ReadOnlyField

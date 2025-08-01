import React, { FunctionComponent, useState } from 'react'
import { bemClass } from '@utils'
import Text from '@base/text'

import './style.scss'
import { CONFIGURED_INPUT_TYPES } from '@config/constant'

const blk = 'dashboard'

interface DashboardProps {}

const Dashboard: FunctionComponent<DashboardProps> = () => {
  const [testInput, setTestInput] = useState('')
  const [testRadio, setTestRadio] = useState('')
  const [testCheckbox, setTestCheckbox] = useState<Array<string>>([])
  return (
    <div className={bemClass([blk])}>
      <div className={bemClass([blk, 'header'])}>
        <Text
          color="gray-darker"
          typography="l"
        >
          Dashboard
        </Text>
      </div>
    </div>
  )
}

export default Dashboard

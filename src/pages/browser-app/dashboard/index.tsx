import React, { FunctionComponent } from 'react'
import { bemClass } from '@utils'
import Text from '@base/text'

import './style.scss'

const blk = 'dashboard'

interface DashboardProps {}

const Dashboard: FunctionComponent<DashboardProps> = () => {

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
      
      <div className={bemClass([blk, 'content'])}>
      </div>
    </div>
  )
}

export default Dashboard

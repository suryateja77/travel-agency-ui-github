import { Button, Text } from '@base'
import { bemClass } from '@utils'
import React, { FunctionComponent } from 'react'

import './style.scss'
import { useLocation } from 'react-router-dom'

const blk = 'monthly-fixed-requests-list'

interface Props {}

const MonthlyFixedRequestsList: FunctionComponent<Props> = () => {
  const location = useLocation()
  return (
    <div className={bemClass([blk])}>
      <div className={bemClass([blk, 'header'])}>
        <Text
          color="gray-darker"
          typography="l"
        >
          Monthly Fixed Requests
        </Text>
        <Button
          category="primary"
          asLink
          href={`${location.pathname}/create`}
          size="medium"
        >
          New Monthly Fixed Request
        </Button>
      </div>
    </div>
  )
}

export default MonthlyFixedRequestsList

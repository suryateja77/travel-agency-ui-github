import { Button, Text } from '@base'
import { bemClass } from '@utils'
import React, { FunctionComponent } from 'react'

import './style.scss'
import { useLocation } from 'react-router-dom'

const blk = 'vehicles-list'

interface Props {}

const VehiclesList: FunctionComponent<Props> = () => {
  const location = useLocation()
  return (
    <div className={bemClass([blk])}>
      <div className={bemClass([blk, 'header'])}>
        <Text
          color="gray-darker"
          typography="l"
        >
          Vehicles
        </Text>
        <Button
          category="primary"
          asLink
          href={`${location.pathname}/create`}
          size="medium"
        >
          New Vehicle
        </Button>
      </div>
    </div>
  )
}

export default VehiclesList

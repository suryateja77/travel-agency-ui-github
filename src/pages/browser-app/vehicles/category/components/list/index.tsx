import { Button, Text } from '@base'
import { bemClass, pathToName } from '@utils'
import React, { FunctionComponent } from 'react'

import './style.scss'
import { useLocation } from 'react-router-dom'

const blk = 'vehicles-list'

interface Props {
  category?: string
}

const VehiclesList: FunctionComponent<Props> = ({ category = '' }) => {
  const location = useLocation()
  return (
    <div className={bemClass([blk])}>
      <div className={bemClass([blk, 'header'])}>
        <Text
          color="gray-darker"
          typography="l"
        >
          {`${pathToName(category)} Vehicles`}
        </Text>
        <Button
          category="primary"
          asLink
          href={`${location.pathname}/create`}
          size="medium"
        >
          {`New ${pathToName(category)} Vehicle`}
        </Button>
      </div>
    </div>
  )
}

export default VehiclesList

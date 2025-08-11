import { Button, Text } from '@base'
import { bemClass } from '@utils'
import React, { FunctionComponent } from 'react'

import './style.scss'
import { useLocation } from 'react-router-dom'

const blk = 'packages-list'

interface Props {}

const PackagesList: FunctionComponent<Props> = () => {
  const location = useLocation()
  return (
    <div className={bemClass([blk])}>
      <div className={bemClass([blk, 'header'])}>
        <Text
          color="gray-darker"
          typography="l"
        >
          Packages
        </Text>
        <Button
          category="primary"
          asLink
          href={`${location.pathname}/create`}
          size="medium"
        >
          New Package
        </Button>
      </div>
    </div>
  )
}

export default PackagesList

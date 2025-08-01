import { bemClass } from '@utils'
import React, { FunctionComponent } from 'react'

import './style.scss'
import Text from '@base/text'

const blk = 'side-nav-header'

interface SideNavHeaderProps {
  isSideNavExpanded: boolean
}

const SideNavHeader: FunctionComponent<SideNavHeaderProps> = ({ isSideNavExpanded }) => {
  return (
    <div className={bemClass([blk])}>
      <p className={bemClass([blk, 'company-initials'])}>L</p>
      {isSideNavExpanded && (
        <Text
          tag="p"
          typography="xl"
          className={bemClass([blk, 'company-name'])}
        >
          Levart
        </Text>
      )}
    </div>
  )
}

export default SideNavHeader

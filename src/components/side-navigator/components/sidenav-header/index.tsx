import { bemClass } from '@utils'
import React, { FunctionComponent } from 'react'

import './style.scss'
import Logo from '@components/logo'

const blk = 'side-nav-header'

interface SideNavHeaderProps {
  isSideNavExpanded: boolean
}

const SideNavHeader: FunctionComponent<SideNavHeaderProps> = ({ isSideNavExpanded }) => {
  return (
    <div className={bemClass([blk])}>
      <Logo />
    </div>
  )
}

export default SideNavHeader

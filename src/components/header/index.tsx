import React, { Dispatch, FunctionComponent, SetStateAction } from 'react'

import { bemClass } from '@utils'

import LogOut from '@components/logout'

import './style.scss'
import Text from '@base/text'
import Logo from '@components/logo'

const blk = 'header'

interface HeaderProps {
  isSideNavExpanded: boolean
  sideNavExpandHandler: Dispatch<SetStateAction<boolean>>
  isNavigationDocked: boolean
  setIsNavigationDocked: Dispatch<SetStateAction<boolean>>
}

const Header: FunctionComponent<HeaderProps> = ({ isSideNavExpanded, isNavigationDocked, sideNavExpandHandler, setIsNavigationDocked }) => {
  return (
    <div className={blk}>
      <div className={bemClass([blk, 'left-section'])}>
        <div
          onClick={() => {
            sideNavExpandHandler(!isSideNavExpanded)
            setIsNavigationDocked(!isNavigationDocked)
          }}
          className={bemClass([blk, 'hamburger-icon'])}
        >
          <div className={bemClass([blk, 'hamburger-row'])} />
          <div className={bemClass([blk, 'hamburger-row'])} />
          <div className={bemClass([blk, 'hamburger-row'])} />
        </div>
      </div>
      <>
        <div className={bemClass([blk, 'logo'])}>
          <Logo />
        </div>
      </>
      <div className={bemClass([blk, 'right-section'])}>
        <LogOut
          category="error"
          size="medium"
        />
      </div>
    </div>
  )
}

export default Header

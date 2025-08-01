import React, { Dispatch, FunctionComponent, SetStateAction } from 'react'
import { NAVIGATION_DATA } from '@config/navigation'
import SideNavHeader from './components/sidenav-header'
import SideNavItem from './components/sidenav-item'

import { bemClass } from '@utils'

import './style.scss'

const blk = 'side-navigator'

interface SideNavigatorProps {
  isSideNavExpanded: boolean
  isNavigationDocked: boolean
  sideNavExpandHandler: Dispatch<SetStateAction<boolean>>
  isMobile?: boolean
}

const SideNavigator: FunctionComponent<SideNavigatorProps> = ({ isSideNavExpanded, isNavigationDocked, sideNavExpandHandler, isMobile = false }) => {
  return (
    <div className={bemClass([blk])}>
      <section className={bemClass([blk, 'header'])}>
        <SideNavHeader isSideNavExpanded />
      </section>
      <section
        onMouseEnter={() => {
          if (!isNavigationDocked) {
            if (!isSideNavExpanded) {
              sideNavExpandHandler(true)
            }
          }
        }}
        onMouseLeave={() => {
          if (!isNavigationDocked) {
            if (isSideNavExpanded) {
              sideNavExpandHandler(false)
            }
          }
        }}
        className={bemClass([blk, 'nav-content'])}
      >
        {NAVIGATION_DATA.map(navItem => {
          return (
            <ul key={navItem.group} className={bemClass([blk, 'nav-link-list'])}>
                {navItem.routes.map(route => {
                  return (
                    <li
                      key={route.name}
                      className={bemClass([blk, 'nav-link-wrapper'])}
                    >
                      <SideNavItem
                        isSideNavExpanded={isSideNavExpanded}
                        route={route}
                        sideNavExpandHandler={sideNavExpandHandler}
                        isMobile={isMobile}
                      />
                    </li>
                  )
                })}
              </ul>
          )
        })}
      </section>
    </div>
  )
}

export default SideNavigator

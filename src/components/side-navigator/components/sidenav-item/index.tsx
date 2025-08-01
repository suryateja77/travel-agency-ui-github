import React, { Dispatch, FunctionComponent, SetStateAction, useState } from 'react'
import { bemClass } from '@utils'
import { NavLink, useLocation } from 'react-router-dom'
import { RouteData } from '@config/navigation'
import Text from '@base/text'

import './style.scss'
import Icon from '@base/icon'

const blk = 'sidenav-item'

interface SideNavItemProps {
  isSideNavExpanded: boolean
  sideNavExpandHandler: Dispatch<SetStateAction<boolean>>
  isMobile?: boolean
  route: RouteData
}

const SideNavItem: FunctionComponent<SideNavItemProps> = ({ isSideNavExpanded, sideNavExpandHandler, isMobile = false, route }) => {
  const [isNavItemExpanded, setIsNavItemExpanded] = useState(false)
  const location = useLocation()
  if (route.subRoutes) {
    return (
      <>
        <div
          onClick={() => {
            setIsNavItemExpanded(!isNavItemExpanded)
          }}
          className={bemClass([blk, 'nav-link', { hasSubRoutes: true }])}
        >
          <div className={bemClass([blk, 'nav-link-text'])}>
            {route.image && (
              <img
                className={bemClass([blk, 'nav-img'])}
                src={location.pathname.includes(route.path) ? route.image.selected : route.image.unselected}
                alt="nav-image"
              />
            )}
            <Text
              typography="xs"
              fontWeight="bold"
              color={location.pathname.includes(route.path) ? 'success' : 'white'}
              tag="p"
            >
              {route.name}
            </Text>
          </div>
          <Icon name={isNavItemExpanded ? 'caret-up' : 'caret-down'} />
        </div>
        <div className={bemClass([blk, 'sub-menu', { expanded: isSideNavExpanded && isNavItemExpanded }])}>
          {route.subRoutes.map(subRoute => {
            return (
              <NavLink
                key={subRoute.name}
                to={`${route.path}${subRoute.path}`}
                className={bemClass([blk, 'sub-nav-link'])}
                onClick={() => {
                  if (isMobile) {
                    if (isSideNavExpanded) {
                      sideNavExpandHandler(false)
                    }
                  }
                }}
              >
                <Text
                  typography="xs"
                  fontWeight="bold"
                  color="gray"
                  tag="p"
                  className={bemClass([blk, 'sub-nav-text', { selected: location.pathname.includes(subRoute.path) }])}
                >
                  {subRoute.name}
                </Text>
              </NavLink>
            )
          })}
        </div>
      </>
    )
  }
  return (
    <NavLink
      className={bemClass([blk, 'nav-link'])}
      to={route.path}
      onClick={() => {
        if (isMobile) {
          if (isSideNavExpanded) {
            sideNavExpandHandler(false)
          }
        }
      }}
    >
      {route.image && (
        <img
          className={bemClass([blk, 'nav-img'])}
          src={location.pathname.includes(route.path) ? route.image.selected : route.image.unselected}
          alt="nav-image"
        />
      )}
      <Text
        typography="xs"
        fontWeight="bold"
        color={location.pathname.includes(route.path) ? 'success' : 'white'}
        tag="p"
      >
        {route.name}
      </Text>
    </NavLink>
  )
}

export default SideNavItem

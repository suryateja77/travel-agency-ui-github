import React, { Dispatch, FunctionComponent, SetStateAction, useEffect, useState } from 'react'
import { bemClass, transformConfigurations } from '@utils'
import { NavLink, useLocation } from 'react-router-dom'
import { RouteData } from '@config/navigation'
import Text from '@base/text'

import './style.scss'
import Icon from '@base/icon'
import { useConfigurationsQuery } from '@api/queries/configuration'
import { Configuration } from '@types'

const blk = 'sidenav-item'

interface SideNavItemProps {
  isSideNavExpanded: boolean
  sideNavExpandHandler: Dispatch<SetStateAction<boolean>>
  isMobile?: boolean
  route: RouteData
  expandedNavItem?: string | null
  setExpandedNavItem?: Dispatch<SetStateAction<string | null>>
}

const SideNavItem: FunctionComponent<SideNavItemProps> = ({ isSideNavExpanded, sideNavExpandHandler, isMobile = false, route, expandedNavItem, setExpandedNavItem }) => {
  const { data: configurationsData } = useConfigurationsQuery()
  
  const [subRoutes, setSubRoutes] = useState(route.subRoutes)
  const location = useLocation()
  
  const isNavItemExpanded = expandedNavItem === route.name

  // Helper function to check if the current route matches this nav item
  const isRouteActive = () => {
    const currentPath = location.pathname
    const routePath = route.path
    
    // Exact match for root paths like /dashboard
    if (routePath === '/dashboard' || routePath === '/advance-booking' || routePath === '/advance-payments') {
      return currentPath === routePath
    }
    
    // For other paths, ensure we match from the start and either end there or continue with a slash
    return currentPath === routePath || currentPath.startsWith(routePath + '/')
  }

  useEffect(() => {
    if (configurationsData && configurationsData.data) {
      const configurations: Configuration[] = configurationsData.data
      const configValue = transformConfigurations(configurations, 'navigation')
      if (configValue[route.configurationVariable || ''] && configValue[route.configurationVariable || ''].length > 0) {
        setSubRoutes(configValue[route.configurationVariable || ''])
      }
    }
  }, [configurationsData])

  if (subRoutes) {
    return (
      <>
        <div
          onClick={() => {
            if (setExpandedNavItem) {
              setExpandedNavItem(isNavItemExpanded ? null : route.name)
            }
          }}
          className={bemClass([blk, 'nav-link', { hasSubRoutes: true }])}
        >
          <div className={bemClass([blk, 'nav-link-text'])}>
            {route.image && (
              <img
                className={bemClass([blk, 'nav-img'])}
                src={isRouteActive() ? route.image.selected : route.image.unselected}
                alt="nav-image"
              />
            )}
            <Text
              fontWeight="bold"
              color={isRouteActive() ? 'success' : 'white'}
              tag="p"
            >
              {route.name}
            </Text>
          </div>
          <Icon name={isNavItemExpanded ? 'caret-up' : 'caret-down'} />
        </div>
        <div className={bemClass([blk, 'sub-menu', { expanded: isSideNavExpanded && isNavItemExpanded }])}>
          {subRoutes.map(subRoute => {
            const fullSubRoutePath = `${route.path}${subRoute.path}`
            const isSubRouteActive = location.pathname === fullSubRoutePath || location.pathname.startsWith(fullSubRoutePath + '/')
            
            return (
              <NavLink
                key={subRoute.name}
                to={fullSubRoutePath}
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
                  fontWeight="bold"
                  color="gray"
                  tag="p"
                  className={bemClass([blk, 'sub-nav-text', { selected: isSubRouteActive }])}
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
          src={isRouteActive() ? route.image.selected : route.image.unselected}
          alt="nav-image"
        />
      )}
      <Text
        fontWeight="bold"
        color={isRouteActive() ? 'success' : 'white'}
        tag="p"
      >
        {route.name}
      </Text>
    </NavLink>
  )
}

export default SideNavItem

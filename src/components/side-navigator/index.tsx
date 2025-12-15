import React, { Dispatch, FunctionComponent, SetStateAction, useState, useMemo } from 'react'
import { NAVIGATION_DATA, RouteData } from '@config/navigation'
import SideNavHeader from './components/sidenav-header'
import SideNavItem from './components/sidenav-item'
import { useAuth } from '@contexts/AuthContext'
import { bemClass, hasModuleAccess, MODULE_NAMES } from '@utils'

import './style.scss'

const blk = 'side-navigator'

interface SideNavigatorProps {
  isSideNavExpanded: boolean
  isNavigationDocked: boolean
  sideNavExpandHandler: Dispatch<SetStateAction<boolean>>
  isMobile?: boolean
}

/**
 * Get module name for permission check from sub-route
 */
const getModuleNameForSubRoute = (parentPath: string, subRoutePath: string, subRouteName: string): string => {
  const fullPath = `${parentPath}${subRoutePath}`
  
  // Map sub-routes to their specific permission modules
  const subRouteMapping: Record<string, string> = {
    '/requests/regular': 'Regular Requests',
    '/requests/monthly-fixed': 'Monthly Fixed Requests',
    '/payments/vehicle': 'Vehicle Payments',
    '/payments/staff': 'Staff Payments',
    '/payments/supplier': 'Supplier Payments',
    '/reports/business': 'Business Reports',
    '/reports/vehicle': 'Vehicle Reports',
    '/users/user-list': 'User List',
    '/users/user-roles': 'User Roles',
    '/users/user-groups': 'User Groups',
    '/settings/configurations': 'Configurations',
    '/settings/profile': 'Profile',
  }
  
  return subRouteMapping[fullPath] || subRouteName
}

const SideNavigator: FunctionComponent<SideNavigatorProps> = ({ isSideNavExpanded, isNavigationDocked, sideNavExpandHandler, isMobile = false }) => {
  const [expandedNavItem, setExpandedNavItem] = useState<string | null>(null)
  const { permissions } = useAuth()

  // Filter navigation items based on user permissions
  const filteredNavigationData = useMemo(() => {
    return NAVIGATION_DATA.map(navGroup => ({
      ...navGroup,
      routes: navGroup.routes
        .map(route => {
          // Filter sub-routes based on granular permissions
          const filteredSubRoutes = route.subRoutes?.filter(subRoute => {
            const moduleName = getModuleNameForSubRoute(route.path, subRoute.path, subRoute.name)
            return hasModuleAccess(permissions, moduleName)
          })
          
          // If route has sub-routes, only show if at least one sub-route is accessible
          if (route.subRoutes && route.subRoutes.length > 0) {
            return filteredSubRoutes && filteredSubRoutes.length > 0
              ? { ...route, subRoutes: filteredSubRoutes }
              : null
          }
          
          // For routes without sub-routes, check direct permission
          // Use simple module name mapping for top-level routes
          const moduleMapping: Record<string, string> = {
            'Dashboard': 'Dashboard',
            'Packages': 'Packages',
            'Vehicles': 'Vehicles',
            'Staff': 'Staff',
            'Customers': 'Customers',
            'Expenses': 'Expenses',
            'Advance Booking': 'Advance Bookings',
            'Advance Payments': 'Advance Payments',
            'Suppliers': 'Suppliers',
          }
          const moduleName = moduleMapping[route.name] || route.name
          return hasModuleAccess(permissions, moduleName) ? route : null
        })
        .filter((route): route is RouteData => route !== null)
    })).filter(navGroup => navGroup.routes.length > 0) // Remove empty groups
  }, [permissions])

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
        {filteredNavigationData.map(navItem => {
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
                        expandedNavItem={expandedNavItem}
                        setExpandedNavItem={setExpandedNavItem}
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

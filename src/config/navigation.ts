import DashboardIcon from '../images/icons/nav-dashboard.webp'
import SupplierIcon from '../images/icons/nav-supplier.webp'
import BuyerIcon from '../images/icons/nav-buyer.webp'
import ProductIcon from '../images/icons/nav-products.webp'
import SettingIcon from '../images/icons/nav-settings.webp'
import UserIcon from '../images/icons/nav-users.webp'
import OrderIcon from '../images/icons/nav-orders.webp'

import DashboardIconSelected from '../images/icons/nav-dashboard-selected.webp'
import SupplierIconSelected from '../images/icons/nav-supplier-selected.webp'
import BuyerIconSelected from '../images/icons/nav-buyer-selected.webp'
import ProductIconSelected from '../images/icons/nav-products-selected.webp'
import SettingIconSelected from '../images/icons/nav-settings-selected.webp'
import UserIconSelected from '../images/icons/nav-users-selected.webp'
import OrderIconSelected from '../images/icons/nav-orders-selected.webp'

type SubRoute = {
  path: string
  name: string
}

export type RouteData = {
  path: string
  name: string
  image: {
    unselected: string
    selected: string
  }
  subRoutes?: Array<SubRoute>
}

type NavigationItem = {
  group: string
  routes: Array<RouteData>
}

const NAVIGATION_DATA: Array<NavigationItem> = [
  {
    group: 'Quick Access',
    routes: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        image: {
          selected: DashboardIconSelected,
          unselected: DashboardIcon,
        },
      },
      {
        path: '/products',
        name: 'Products',
        image: {
          selected: ProductIconSelected,
          unselected: ProductIcon,
        },
      },
      {
        path: '/freight-forwarders',
        name: 'Freight forwarders',
        image: {
          selected: SupplierIconSelected,
          unselected: SupplierIcon,
        },
      },
      {
        path: '/buyers',
        name: 'Buyers',
        image: {
          selected: BuyerIconSelected,
          unselected: BuyerIcon,
        },
      },
      {
        path: '/suppliers',
        name: 'Suppliers',
        image: {
          selected: SupplierIconSelected,
          unselected: SupplierIcon,
        },
      },
      {
        path: '/orders',
        name: 'Orders',
        image: {
          selected: OrderIconSelected,
          unselected: OrderIcon,
        },
      },
      {
        path: '/agents',
        name: 'Agents',
        image: {
          selected: UserIconSelected,
          unselected: UserIcon,
        },
      },
      {
        path: '/users',
        name: 'Users',
        image: {
          selected: UserIconSelected,
          unselected: UserIcon,
        },
        subRoutes: [
          {
            path: '/user-list',
            name: 'User List',
          },
          {
            path: '/user-groups',
            name: 'User Groups',
          },
          {
            path: '/user-roles',
            name: 'User Roles',
          },
        ],
      },
      {
        path: '/settings',
        name: 'Settings',
        image: {
          selected: SettingIconSelected,
          unselected: SettingIcon,
        },
        subRoutes: [
          {
            path: '/configuration',
            name: 'Configuration',
          },
          {
            path: '/profile',
            name: 'Profile',
          },
          {
            path: '/branches',
            name: 'Branches',
          },
        ],
      },
    ],
  },
]

export { NAVIGATION_DATA }

import DashboardIcon from '../images/icons/dashboard.webp'
import RequestsIcon from '../images/icons/requests.webp'
import PackagesIcon from '../images/icons/packages.webp'
import VehiclesIcon from '../images/icons/vehicles.webp'
import PaymentsIcon from '../images/icons/payments.webp'
import ReportsIcon from '../images/icons/report.webp'
import AdvanceBooking from '../images/icons/advance-booking.webp'
import AdvancePayment from '../images/icons/advance-payment.webp'
import SettingsIcon from '../images/icons/business.webp'

import DashboardIconSelected from '../images/icons/dashboard-selected.webp'
import RequestsIconSelected from '../images/icons/requests-selected.webp'
import PackagesIconSelected from '../images/icons/packages-selected.webp'
import VehiclesIconSelected from '../images/icons/vehicles-selected.webp'
import PaymentsIconSelected from '../images/icons/payments-selected.webp'
import ReportsIconSelected from '../images/icons/report-selected.webp'
import AdvanceBookingSelected from '../images/icons/advance-booking-selected.webp'
import AdvancePaymentSelected from '../images/icons/advance-payment-selected.webp'
import SettingsIconSelected from '../images/icons/business-selected.webp'

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
        path: '/requests',
        name: 'Requests',
        image: {
          selected: RequestsIconSelected,
          unselected: RequestsIcon,
        },
        subRoutes: [
          {
            path: '/regular',
            name: 'Regular',
          },
          {
            path: '/monthly-fixed',
            name: 'Monthly Fixed',
          },
        ],
      },
      {
        path: '/packages',
        name: 'Packages',
        image: {
          selected: PackagesIconSelected,
          unselected: PackagesIcon,
        },
        subRoutes: [
          {
            path: '/local',
            name: 'Local',
          },
        ],
      },
      {
        path: '/vehicles',
        name: 'Vehicles',
        image: {
          selected: VehiclesIconSelected,
          unselected: VehiclesIcon,
        },
        subRoutes: [
          {
            path: '/own',
            name: 'Own',
          },
        ],
      },
      {
        path: '/payments',
        name: 'Payments',
        image: {
          selected: PaymentsIconSelected,
          unselected: PaymentsIcon,
        },
        subRoutes: [
          {
            path: '/vehicle',
            name: 'Vehicle',
          },
          {
            path: '/staff',
            name: 'Staff',
          },
        ],
      },
      {
        path: '/reports',
        name: 'Reports',
        image: {
          selected: ReportsIconSelected,
          unselected: ReportsIcon,
        },
        subRoutes: [
          {
            path: '/business',
            name: 'Settings',
          },
          {
            path: '/vehicle',
            name: 'Vehicle',
          },
        ],
      },
      {
        path: '/advance-booking',
        name: 'Advance Booking',
        image: {
          selected: AdvanceBookingSelected,
          unselected: AdvanceBooking,
        },
      },
      {
        path: '/advance-payments',
        name: 'Advance Payments',
        image: {
          selected: AdvancePaymentSelected,
          unselected: AdvancePayment,
        },
      },
      {
        path: '/settings',
        name: 'Settings',
        image: {
          selected: SettingsIconSelected,
          unselected: SettingsIcon,
        },
        subRoutes: [
          {
            path: '/configurations',
            name: 'Configurations',
          },
          {
            path: '/profile',
            name: 'Profile',
          },
        ],
      },
    ],
  },
]

export { NAVIGATION_DATA }

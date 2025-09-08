import DashboardIcon from '../images/icons/dashboard.webp'
import RequestsIcon from '../images/icons/requests.webp'
import PackagesIcon from '../images/icons/packages.webp'
import VehiclesIcon from '../images/icons/vehicles.webp'
import StaffIcon from '../images/icons/staff.webp'
import CustomerIcon from '../images/icons/customers.webp'
import ExpensesIcon from '../images/icons/expenses.webp'
import PaymentsIcon from '../images/icons/payments.webp'
import ReportsIcon from '../images/icons/report.webp'
import AdvanceBooking from '../images/icons/advance-booking.webp'
import AdvancePayment from '../images/icons/advance-payment.webp'
import Supplier from '../images/icons/supplier.webp'
import SettingsIcon from '../images/icons/business.webp'

import DashboardIconSelected from '../images/icons/dashboard-selected.webp'
import RequestsIconSelected from '../images/icons/requests-selected.webp'
import PackagesIconSelected from '../images/icons/packages-selected.webp'
import VehiclesIconSelected from '../images/icons/vehicles-selected.webp'
import StaffIconSelected from '../images/icons/staff-selected.webp'
import CustomerIconSelected from '../images/icons/customers-selected.webp'
import ExpensesIconSelected from '../images/icons/expenses-selected.webp'
import PaymentsIconSelected from '../images/icons/payments-selected.webp'
import ReportsIconSelected from '../images/icons/report-selected.webp'
import AdvanceBookingSelected from '../images/icons/advance-booking-selected.webp'
import AdvancePaymentSelected from '../images/icons/advance-payment-selected.webp'
import SupplierSelected from '../images/icons/supplier-selected.webp'
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
  configurable: boolean
  configurationVariable?: string
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
        configurable: false,
        name: 'Dashboard',
        image: {
          selected: DashboardIconSelected,
          unselected: DashboardIcon,
        },
      },
      {
        path: '/requests',
        configurable: false,
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
        configurable: true,
        configurationVariable: 'Package category',
        name: 'Packages',
        image: {
          selected: PackagesIconSelected,
          unselected: PackagesIcon,
        },
        subRoutes: [],
      },
      {
        path: '/vehicles',
        configurable: true,
        configurationVariable: 'Vehicle category',
        name: 'Vehicles',
        image: {
          selected: VehiclesIconSelected,
          unselected: VehiclesIcon,
        },
        subRoutes: [
        ],
      },
      {
        path: '/staff',
        configurable: true,
        configurationVariable: 'Staff category',
        name: 'Staff',
        image: {
          selected: StaffIconSelected,
          unselected: StaffIcon,
        },
        subRoutes: [
        ],
      },
      {
        path: '/customers',
        configurable: true,
        configurationVariable: 'Customer category',
        name: 'Customers',
        image: {
          selected: CustomerIconSelected,
          unselected: CustomerIcon,
        },
        subRoutes: [
        ],
      },
      {
        path: '/expenses',
        configurable: true,
        configurationVariable: 'Expense category',
        name: 'Expenses',
        image: {
          selected: ExpensesIconSelected,
          unselected: ExpensesIcon,
        },
        subRoutes: [
        ],
      },
      {
        path: '/payments',
        configurable: false,
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
        configurable: false,
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
        configurable: false,
        name: 'Advance Booking',
        image: {
          selected: AdvanceBookingSelected,
          unselected: AdvanceBooking,
        },
      },
      {
        path: '/advance-payments',
        configurable: false,
        name: 'Advance Payments',
        image: {
          selected: AdvancePaymentSelected,
          unselected: AdvancePayment,
        },
      },
      {
        path: '/suppliers',
        configurable: false,
        name: 'Suppliers',
        image: {
          selected: SupplierSelected,
          unselected: Supplier,
        },
      },
      {
        path: '/settings',
        configurable: false,
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

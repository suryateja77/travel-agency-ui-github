import DashboardIcon from '../images/icons/navigation/dashboard.webp'
import RequestsIcon from '../images/icons/navigation/requests.webp'
import PackagesIcon from '../images/icons/navigation/packages.webp'
import VehiclesIcon from '../images/icons/navigation/vehicles.webp'
import StaffIcon from '../images/icons/navigation/staff.webp'
import CustomerIcon from '../images/icons/navigation/customers.webp'
import ExpensesIcon from '../images/icons/navigation/expenses.webp'
import PaymentsIcon from '../images/icons/navigation/payments.webp'
import ReportsIcon from '../images/icons/navigation/report.webp'
import AdvanceBooking from '../images/icons/navigation/advance-booking.webp'
import AdvancePayment from '../images/icons/navigation/advance-payment.webp'
import Supplier from '../images/icons/navigation/supplier.webp'
import SettingsIcon from '../images/icons/navigation/business.webp'

import DashboardIconSelected from '../images/icons/navigation/dashboard-selected.webp'
import RequestsIconSelected from '../images/icons/navigation/requests-selected.webp'
import PackagesIconSelected from '../images/icons/navigation/packages-selected.webp'
import VehiclesIconSelected from '../images/icons/navigation/vehicles-selected.webp'
import StaffIconSelected from '../images/icons/navigation/staff-selected.webp'
import CustomerIconSelected from '../images/icons/navigation/customers-selected.webp'
import ExpensesIconSelected from '../images/icons/navigation/expenses-selected.webp'
import PaymentsIconSelected from '../images/icons/navigation/payments-selected.webp'
import ReportsIconSelected from '../images/icons/navigation/report-selected.webp'
import AdvanceBookingSelected from '../images/icons/navigation/advance-booking-selected.webp'
import AdvancePaymentSelected from '../images/icons/navigation/advance-payment-selected.webp'
import SupplierSelected from '../images/icons/navigation/supplier-selected.webp'
import SettingsIconSelected from '../images/icons/navigation/business-selected.webp'

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
        path: '/suppliers',
        configurable: false,
        name: 'Suppliers',
        image: {
          selected: SupplierSelected,
          unselected: Supplier,
        },
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
          {
            path: '/supplier',
            name: 'Supplier',
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
            name: 'Business',
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
        path: '/users',
        configurable: false,
        name: 'Users',
        image: {
          selected: StaffIconSelected,
          unselected: StaffIcon,
        },
        subRoutes: [
          {
            path: '/user-list',
            name: 'User List',
          },
          {
            path: '/user-roles',
            name: 'User Roles',
          },
          {
            path: '/user-groups',
            name: 'User Groups',
          },
        ],
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

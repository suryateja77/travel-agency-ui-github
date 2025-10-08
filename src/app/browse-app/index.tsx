import React, { lazy, Suspense, useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import Header from '@components/header'
import './style.scss'
import { bemClass } from '@utils'
import SideNavigator from '@components/side-navigator'
import Requests from '@pages/browser-app/requests'
import RegularRequests from '@pages/browser-app/requests/regular'
import MonthlyFixedRequests from '@pages/browser-app/requests/monthly-fixed'
import AdvanceBookings from '@pages/browser-app/advance-booking'
import AdvancePayments from '@pages/browser-app/advance-payments'
import Settings from '@pages/browser-app/settings'
import Configuration from '@pages/browser-app/settings/configuration'
import Profile from '@pages/browser-app/settings/profile'
import Packages from '@pages/browser-app/packages'
import CategoryPackages from '@pages/browser-app/packages/category'
import Vehicles from '@pages/browser-app/vehicles'
import CategoryVehicles from '@pages/browser-app/vehicles/category'
import CategoryExpenses from '@pages/browser-app/expenses/category'
import Expenses from '@pages/browser-app/expenses'
import Staff from '@pages/browser-app/staff'
import CategoryStaff from '@pages/browser-app/staff/category'
import Customers from '@pages/browser-app/customers'
import CategoryCustomers from '@pages/browser-app/customers/category'
import Suppliers from '@pages/browser-app/suppliers'
import Reports from '@pages/browser-app/reports'

const blk = 'browse-app'

const Dashboard = lazy(async () => await import(/* webpackChunkName: "browse-app-dashboard" */ '../../pages/browser-app/dashboard'))

const BrowseApp = () => {
  const [expandNavigator, setExpandNavigator] = useState(false)
  const [navigationDocked, setNavigationDocked] = useState(false)
  const [isMobile, setIsMobile] = useState(true)
  const [] = useState(
    bemClass([
      blk,
      {
        expanded: false,
      },
    ]),
  )
  useEffect(() => {
    const handleViewportDetection = () => {
      const viewportWidth = window.innerWidth
      const isMobileView = viewportWidth < 1200
      setIsMobile(isMobileView)
      setExpandNavigator(!isMobileView)
      setNavigationDocked(!isMobileView)
    }

    handleViewportDetection()
    window.addEventListener('resize', handleViewportDetection)
    return () => {
      window.removeEventListener('resize', handleViewportDetection)
    }
  }, [])
  return (
    <main className={bemClass([blk, 'container'])}>
      <section className={bemClass([blk, 'navigation', { expanded: expandNavigator }])}>
        <SideNavigator
          isSideNavExpanded={expandNavigator}
          isNavigationDocked={navigationDocked}
          sideNavExpandHandler={setExpandNavigator}
        />
      </section>
      <section className={bemClass([blk, 'content', { expanded: expandNavigator }])}>
        <div className={bemClass([blk, 'header'])}>
          <Header
            isSideNavExpanded={expandNavigator}
            sideNavExpandHandler={setExpandNavigator}
            isNavigationDocked={navigationDocked}
            setIsNavigationDocked={setNavigationDocked}
          />
        </div>
        <div className={bemClass([blk, 'page'])}>
          <section className={bemClass([blk, 'mobile-navigation', { expanded: expandNavigator }])}>
            <SideNavigator
              isSideNavExpanded={expandNavigator}
              isNavigationDocked={navigationDocked}
              sideNavExpandHandler={setExpandNavigator}
              isMobile={isMobile}
            />
          </section>
          <section className={bemClass([blk, 'page-content', { expanded: expandNavigator }])}>
            <Suspense>
              <Routes>
                <Route
                  path="/dashboard"
                  element={<Dashboard />}
                />
                <Route
                  path="/requests/*"
                  element={<Requests />}
                >
                  <Route
                    path="regular/*"
                    element={<RegularRequests />}
                  />
                  <Route
                    path="monthly-fixed/*"
                    element={<MonthlyFixedRequests />}
                  />
                </Route>
                <Route
                  path="/packages/*"
                  element={<Packages />}
                >
                  <Route
                    path=":category/*"
                    element={<CategoryPackages />}
                  />
                </Route>
                <Route
                  path="/vehicles/*"
                  element={<Vehicles />}
                >
                  <Route
                    path=":category/*"
                    element={<CategoryVehicles />}
                  />
                </Route>
                <Route
                  path="/expenses/*"
                  element={<Expenses />}
                >
                  <Route
                    path=":category/*"
                    element={<CategoryExpenses />}
                  />
                </Route>
                <Route
                  path="/staff/*"
                  element={<Staff />}
                >
                  <Route
                    path=":category/*"
                    element={<CategoryStaff />}
                  />
                </Route>
                <Route
                  path="/customers/*"
                  element={<Customers />}
                >
                  <Route
                    path=":category/*"
                    element={<CategoryCustomers />}
                  />
                </Route>
                <Route
                  path="/advance-booking/*"
                  element={<AdvanceBookings />}
                />
                <Route
                  path="/advance-payments/*"
                  element={<AdvancePayments />}
                />
                <Route
                  path="/suppliers/*"
                  element={<Suppliers />}
                />
                <Route
                  path="/reports/*"
                  element={<Reports />}
                />
                <Route
                  path="/settings/*"
                  element={<Settings />}
                >
                  <Route
                    path="configurations/*"
                    element={<Configuration />}
                  />
                  <Route
                    path="profile/*"
                    element={<Profile />}
                  />
                </Route>
                <Route
                  path="*"
                  element={<Navigate to="/dashboard" />}
                />
              </Routes>
            </Suspense>
          </section>
        </div>
      </section>
    </main>
  )
}

export default BrowseApp

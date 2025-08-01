import React, { lazy, Suspense, useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import Header from '@components/header'
import './style.scss'
import { bemClass } from '@utils'
import SideNavigator from '@components/side-navigator'

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

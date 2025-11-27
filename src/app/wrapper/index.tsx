import React, { lazy, Suspense, useEffect } from 'react'
import axios from 'axios'

import { getStorageItem, setStorageItem, removeStorageItem } from '@utils/storage'

const BrowseApp = lazy(async () => await import(/* webpackChunkName: "browse-app" */ '../browse-app'))
const AuthenticationApp = lazy(async () => await import(/* webpackChunkName: "authentication-app" */ '../authentication-app'))

const Wrapper = () => {
  const isLoggedIn = !!getStorageItem('session', 'isLoggedIn')

  useEffect(() => {
    if (!isLoggedIn) return

    // Check and refresh token proactively before expiration
    const checkAndRefreshToken = async () => {
      const sessionExpiry = getStorageItem('session', 'sessionExpiry')
      if (!sessionExpiry) return

      const expiryTime = parseInt(sessionExpiry, 10)
      const currentTime = Date.now()
      const timeUntilExpiry = expiryTime - currentTime

      // Refresh token 30 minutes before expiration (1800000 ms)
      const REFRESH_THRESHOLD = 30 * 60 * 1000

      if (timeUntilExpiry < REFRESH_THRESHOLD && timeUntilExpiry > 0) {
        try {
          const response = await axios.post('/api/user/refresh-token', {}, { withCredentials: true })
          const { expiresIn } = response.data
          
          // Update session expiration time
          const newExpirationTime = Date.now() + (expiresIn * 1000)
          setStorageItem('session', 'sessionExpiry', newExpirationTime.toString())
          
          console.log('Token refreshed proactively')
        } catch (error) {
          console.error('Failed to refresh token:', error)
          // If refresh fails, logout user
          removeStorageItem('session', 'isLoggedIn')
          removeStorageItem('session', 'sessionExpiry')
          window.location.replace('/')
        }
      } else if (timeUntilExpiry <= 0) {
        // Session expired, logout
        removeStorageItem('session', 'isLoggedIn')
        removeStorageItem('session', 'sessionExpiry')
        window.location.replace('/')
      }
    }

    // Check immediately on mount
    checkAndRefreshToken()

    // Check every 5 minutes
    const interval = setInterval(checkAndRefreshToken, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [isLoggedIn])

  return <Suspense>{isLoggedIn ? <BrowseApp /> : <AuthenticationApp />}</Suspense>
}

export default Wrapper

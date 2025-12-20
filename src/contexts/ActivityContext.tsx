import React, { createContext, useContext, useEffect, useCallback, useRef, ReactNode } from 'react'
import { useRefreshTokenMutation } from '@api/queries/user'
import { getStorageItem, removeStorageItem, setStorageItem } from '@utils/storage'

interface ActivityContextType {
  resetInactivityTimer: () => void
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined)

// Configuration
const INACTIVITY_TIMEOUT = parseInt(process.env.REACT_APP_INACTIVITY_TIMEOUT_MINUTES || '120', 10) * 60 * 1000 // Default 2 hours
const TOKEN_REFRESH_THRESHOLD = 30 * 60 * 1000 // Refresh if token expires within 30 minutes
const ACTIVITY_THROTTLE = 60 * 1000 // Check token refresh max once per minute

export const ActivityProvider = ({ children }: { children: ReactNode }) => {
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastActivityRef = useRef<number>(Date.now())
  const lastRefreshCheckRef = useRef<number>(0)
  const isRefreshingRef = useRef<boolean>(false)
  const { mutateAsync: refreshToken } = useRefreshTokenMutation()

  // Logout user due to inactivity or session termination
  const logoutUser = useCallback(() => {
    console.log('User logged out due to inactivity or session termination')
    removeStorageItem('local', 'isLoggedIn')
    removeStorageItem('local', 'sessionExpiry')
    removeStorageItem('local', 'lastActivity')
    window.location.replace('/')
  }, [])

  // Check if token needs refresh and refresh if necessary
  const checkAndRefreshToken = useCallback(async () => {
    const now = Date.now()
    
    // Throttle refresh checks (max once per minute)
    if (now - lastRefreshCheckRef.current < ACTIVITY_THROTTLE) {
      return
    }
    
    lastRefreshCheckRef.current = now

    const sessionExpiry = getStorageItem('local', 'sessionExpiry')
    if (!sessionExpiry) return

    const expiryTime = parseInt(sessionExpiry, 10)
    const timeUntilExpiry = expiryTime - now

    // If token expires within threshold, refresh it
    if (timeUntilExpiry < TOKEN_REFRESH_THRESHOLD && timeUntilExpiry > 0) {
      // Prevent multiple tabs from refreshing simultaneously
      if (isRefreshingRef.current) {
        console.log('Token refresh already in progress')
        return
      }
      
      try {
        isRefreshingRef.current = true
        console.log('Refreshing token due to user activity')
        const response = await refreshToken()
        const { expiresIn } = response.data
        
        // Update session expiration time (shared across all tabs via localStorage)
        const newExpirationTime = Date.now() + (expiresIn * 1000)
        setStorageItem('local', 'sessionExpiry', newExpirationTime.toString())
        
        console.log('Token refreshed successfully - all tabs will benefit')
      } catch (error) {
        console.error('Failed to refresh token:', error)
        // If refresh fails, logout user (will affect all tabs)
        logoutUser()
      } finally {
        isRefreshingRef.current = false
      }
    } else if (timeUntilExpiry <= 0) {
      // Session expired, logout
      console.log('Session expired, logging out')
      logoutUser()
    }
  }, [refreshToken, logoutUser])

  // Reset inactivity timer on user activity
  const resetInactivityTimer = useCallback(() => {
    const now = Date.now()
    lastActivityRef.current = now
    setStorageItem('local', 'lastActivity', now.toString())

    // Clear existing timer
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current)
    }

    // Check if token needs refresh
    checkAndRefreshToken()

    // Set new inactivity timer
    inactivityTimerRef.current = setTimeout(() => {
      logoutUser()
    }, INACTIVITY_TIMEOUT)
  }, [checkAndRefreshToken, logoutUser])

  // Setup activity listeners
  useEffect(() => {
    const isLoggedIn = !!getStorageItem('local', 'isLoggedIn')
    if (!isLoggedIn) return

    // Initialize last activity time
    const lastActivity = getStorageItem('local', 'lastActivity')
    if (lastActivity) {
      const lastActivityTime = parseInt(lastActivity, 10)
      const timeSinceActivity = Date.now() - lastActivityTime
      
      // If user was inactive for more than inactivity timeout, logout
      if (timeSinceActivity > INACTIVITY_TIMEOUT) {
        logoutUser()
        return
      }
    }

    // Activity events to track
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ]

    // Throttled activity handler
    let activityTimeout: NodeJS.Timeout | null = null
    const handleActivity = () => {
      if (activityTimeout) return
      
      activityTimeout = setTimeout(() => {
        resetInactivityTimer()
        activityTimeout = null
      }, 1000) // Throttle activity events to once per second
    }

    // Add event listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity, true)
    })

    // Initialize inactivity timer
    resetInactivityTimer()

    // Cleanup
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity, true)
      })
      
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current)
      }
      
      if (activityTimeout) {
        clearTimeout(activityTimeout)
      }
    }
  }, [resetInactivityTimer, logoutUser])

  // Check for session expiry on visibility change (user switches tabs)
  useEffect(() => {
    const isLoggedIn = !!getStorageItem('local', 'isLoggedIn')
    if (!isLoggedIn) return

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const sessionExpiry = getStorageItem('local', 'sessionExpiry')
        if (sessionExpiry) {
          const expiryTime = parseInt(sessionExpiry, 10)
          const now = Date.now()
          
          if (now >= expiryTime) {
            // Session expired while user was away
            logoutUser()
          } else {
            // Check if we crossed inactivity threshold
            const lastActivity = getStorageItem('local', 'lastActivity')
            if (lastActivity) {
              const lastActivityTime = parseInt(lastActivity, 10)
              const timeSinceActivity = now - lastActivityTime
              
              if (timeSinceActivity > INACTIVITY_TIMEOUT) {
                logoutUser()
              } else {
                // Reset timer if still within inactivity window
                resetInactivityTimer()
              }
            }
          }
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [resetInactivityTimer, logoutUser])

  // Cross-tab synchronization: Listen for storage events from other tabs
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      // Storage event fires when localStorage changes in OTHER tabs
      if (event.storageArea !== localStorage) return

      // Handle logout from another tab
      if (event.key === 'isLoggedIn' && event.newValue === null) {
        console.log('Logout detected from another tab - syncing logout')
        window.location.replace('/')
        return
      }

      // Handle login from another tab
      if (event.key === 'isLoggedIn' && event.newValue === 'true' && event.oldValue === null) {
        console.log('Login detected from another tab - syncing session')
        // Reload the page to initialize session in this tab
        window.location.reload()
        return
      }

      // Handle session expiry update from another tab
      if (event.key === 'sessionExpiry' && event.newValue) {
        console.log('Session expiry updated from another tab')
        // Token was refreshed in another tab, no action needed
        // Next activity check will see the updated expiry
      }

      // Handle activity update from another tab
      if (event.key === 'lastActivity' && event.newValue) {
        console.log('Activity detected from another tab - resetting inactivity timer')
        // Update local reference
        lastActivityRef.current = parseInt(event.newValue, 10)
        // Reset inactivity timer since user is active in another tab
        if (inactivityTimerRef.current) {
          clearTimeout(inactivityTimerRef.current)
          inactivityTimerRef.current = setTimeout(() => {
            logoutUser()
          }, INACTIVITY_TIMEOUT)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [logoutUser])

  const value = {
    resetInactivityTimer,
  }

  return <ActivityContext.Provider value={value}>{children}</ActivityContext.Provider>
}

export const useActivity = () => {
  const context = useContext(ActivityContext)
  if (context === undefined) {
    throw new Error('useActivity must be used within an ActivityProvider')
  }
  return context
}

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useUserProfileQuery } from '@api/queries/user-profile'
import { getStorageItem } from '@utils/storage'

export interface Permission {
  module: string
  view: boolean
  edit: boolean
  delete: boolean
}

interface AuthContextType {
  isAdmin: boolean
  isLoading: boolean
  userProfile: any | null
  permissions: Permission[]
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState(false)
  const [permissions, setPermissions] = useState<Permission[]>([])
  const isLoggedIn = !!getStorageItem('session', 'isLoggedIn')
  
  // Only fetch user profile if logged in
  const { data: userProfileResponse, isLoading } = useUserProfileQuery({
    enabled: isLoggedIn
  })

  useEffect(() => {
    if (userProfileResponse?.data) {
      // Backend calculates isAdmin by comparing user._id with client.adminUserId
      setIsAdmin(userProfileResponse.data.isAdmin || false)
      
      // Extract permissions from user role
      const userPermissions = userProfileResponse.data.role?.permissions || []
      setPermissions(userPermissions)
    }
  }, [userProfileResponse])

  const value = {
    isAdmin,
    isLoading: isLoggedIn ? isLoading : false,
    userProfile: userProfileResponse?.data || null,
    permissions,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

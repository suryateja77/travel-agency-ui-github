import React, { FunctionComponent, ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@contexts/AuthContext'
import { hasPermission, getModuleFromPath } from '@utils/permissions'

interface PermissionGuardProps {
  children: ReactNode
  module?: string  // Optional: specify module name, otherwise infer from path
  requiredPermission: 'view' | 'edit' | 'delete'
  fallbackPath?: string  // Where to redirect if no permission (default: /dashboard)
}

/**
 * PermissionGuard Component
 * 
 * Wraps routes to prevent unauthorized access based on user permissions.
 * If user doesn't have required permission, redirects to fallback path.
 * 
 * @example
 * // For list pages (require view permission)
 * <PermissionGuard module="Customers" requiredPermission="view">
 *   <CustomerList />
 * </PermissionGuard>
 * 
 * // For create/edit pages (require edit permission)
 * <PermissionGuard module="Customers" requiredPermission="edit">
 *   <CustomerForm />
 * </PermissionGuard>
 * 
 * // Auto-detect module from path
 * <PermissionGuard requiredPermission="view">
 *   <CustomerList />
 * </PermissionGuard>
 */
const PermissionGuard: FunctionComponent<PermissionGuardProps> = ({
  children,
  module,
  requiredPermission,
  fallbackPath = '/dashboard',
}) => {
  const { permissions, isLoading } = useAuth()
  const location = useLocation()

  // If still loading auth data, show nothing (or loading spinner)
  if (isLoading) {
    return null
  }

  // Determine module name
  const moduleName = module || getModuleFromPath(location.pathname)

  // If module cannot be determined, allow access (shouldn't happen in practice)
  if (!moduleName) {
    return <>{children}</>
  }

  // Check if user has required permission
  const hasAccess = hasPermission(permissions, moduleName, requiredPermission)

  // If no access, redirect to fallback path
  if (!hasAccess) {
    return <Navigate to={fallbackPath} replace />
  }

  // User has permission, render children
  return <>{children}</>
}

export default PermissionGuard

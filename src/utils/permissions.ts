/**
 * Permission Utilities for Role-Based Access Control (RBAC)
 * 
 * These utilities help check user permissions for different modules and actions.
 * Permissions are structured as: { module: string, view: boolean, edit: boolean, delete: boolean }
 */

import { Permission } from '@contexts/AuthContext'

/**
 * Module name mappings from route paths to permission module names
 * This ensures consistent mapping between navigation and permission checks
 */
export const MODULE_NAMES = {
  dashboard: 'Dashboard',
  regular: 'Regular Requests',
  'monthly-fixed': 'Monthly Fixed Requests',
  packages: 'Packages',
  vehicles: 'Vehicles',
  staff: 'Staff',
  customers: 'Customers',
  expenses: 'Expenses',
  'advance-bookings': 'Advance Bookings',
  'advance-payments': 'Advance Payments',
  'user-list': 'User List',
  'user-roles': 'User Roles',
  suppliers: 'Suppliers',
  configurations: 'Configurations',
  profile: 'Profile',
} as const

/**
 * Sub-route specific mappings
 * Maps full path patterns to granular permission modules
 */
export const SUB_ROUTE_MODULE_NAMES: Record<string, string> = {
  '/requests/regular': 'Regular Requests',
  '/requests/monthly-fixed': 'Monthly Fixed Requests',
  '/payments/vehicle': 'Vehicle Payments',
  '/payments/staff': 'Staff Payments',
  '/payments/supplier': 'Supplier Payments',
  '/reports/business': 'Business Reports',
  '/reports/vehicle': 'Vehicle Reports',
  '/users/user-list': 'User List',
  '/users/user-roles': 'User Roles',
  '/users/user-groups': 'User Groups',
  '/settings/configurations': 'Configurations',
  '/settings/profile': 'Profile',
}

/**
 * Check if user has a specific permission for a module
 * 
 * @param permissions - Array of permission objects from user's role
 * @param module - Module name (e.g., 'Customers', 'Vehicles')
 * @param action - Action type ('view', 'edit', or 'delete')
 * @returns boolean indicating if user has permission
 * 
 * @example
 * hasPermission(permissions, 'Customers', 'view') // true/false
 * hasPermission(permissions, 'Vehicles', 'edit') // true/false
 */
export const hasPermission = (
  permissions: Permission[],
  module: string,
  action: 'view' | 'edit' | 'delete'
): boolean => {
  // If no permissions array, deny access
  if (!permissions || !Array.isArray(permissions)) {
    return false
  }

  // Find permission for the specific module
  const modulePermission = permissions.find(
    (p) => p.module.toLowerCase() === module.toLowerCase()
  )

  // If module not found in permissions, deny access
  if (!modulePermission) {
    return false
  }

  // Return the specific action permission
  return modulePermission[action] === true
}

/**
 * Check if user can view a module
 * 
 * @param permissions - Array of permission objects
 * @param module - Module name
 * @returns boolean
 */
export const canView = (permissions: Permission[], module: string): boolean => {
  return hasPermission(permissions, module, 'view')
}

/**
 * Check if user can edit in a module
 * Note: Edit permission typically implies create permission as well
 * 
 * @param permissions - Array of permission objects
 * @param module - Module name
 * @returns boolean
 */
export const canEdit = (permissions: Permission[], module: string): boolean => {
  return hasPermission(permissions, module, 'edit')
}

/**
 * Check if user can delete in a module
 * 
 * @param permissions - Array of permission objects
 * @param module - Module name
 * @returns boolean
 */
export const canDelete = (permissions: Permission[], module: string): boolean => {
  return hasPermission(permissions, module, 'delete')
}

/**
 * Get module name from route path
 * Converts route paths like '/customers/regular-customer' to module name 'Customers'
 * 
 * @param path - Route path (e.g., '/customers', '/requests/regular-request')
 * @returns Module name or null if not found
 * 
 * @example
 * getModuleFromPath('/customers') // 'Customers'
 * getModuleFromPath('/requests/regular-request') // 'Requests'
 */
export const getModuleFromPath = (path: string): string | null => {
  // First check if it's a sub-route with specific permission
  for (const [routePath, moduleName] of Object.entries(SUB_ROUTE_MODULE_NAMES)) {
    if (path.startsWith(routePath)) {
      return moduleName
    }
  }
  
  // Remove leading slash and split path
  const pathParts = path.replace(/^\//, '').split('/')
  const firstPart = pathParts[0]
  const secondPart = pathParts[1]

  // Check for second-level routes (sub-routes)
  if (secondPart && secondPart in MODULE_NAMES) {
    return MODULE_NAMES[secondPart as keyof typeof MODULE_NAMES]
  }

  // Check if it's in the module names mapping
  if (firstPart in MODULE_NAMES) {
    return MODULE_NAMES[firstPart as keyof typeof MODULE_NAMES]
  }

  // If not found, try capitalizing first part as fallback
  return firstPart.charAt(0).toUpperCase() + firstPart.slice(1)
}

/**
 * Check all permissions for a module
 * Useful for determining what actions are available in a component
 * 
 * @param permissions - Array of permission objects
 * @param module - Module name
 * @returns Object with view, edit, delete boolean flags
 * 
 * @example
 * const perms = getModulePermissions(permissions, 'Customers')
 * // { view: true, edit: true, delete: false }
 */
export const getModulePermissions = (
  permissions: Permission[],
  module: string
): { view: boolean; edit: boolean; delete: boolean } => {
  return {
    view: canView(permissions, module),
    edit: canEdit(permissions, module),
    delete: canDelete(permissions, module),
  }
}

/**
 * Check if user has any permission for a module
 * Useful for showing/hiding entire module in navigation
 * 
 * @param permissions - Array of permission objects
 * @param module - Module name
 * @returns boolean - true if user has at least view permission
 */
export const hasModuleAccess = (
  permissions: Permission[],
  module: string
): boolean => {
  return canView(permissions, module)
}

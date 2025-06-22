import React from 'react';
import { useAuth } from './useAuth';

// REAL ACTIONS based on actual dashboard pages
export const PAGE_ACTIONS = {
  'dashboard': ['access'],
  'queue': ['access'],
  'queue.list': ['access', 'add_queue', 'edit', 'delete', 'allocate', 'export'],
  'queue.units': ['access', 'add_quarters', 'edit', 'delete'],
  'allocations': ['access'],
  'allocations.pending': ['access', 'view_letter', 'approve', 'refuse'],
  'allocations.active': ['access', 'view_letter', 'ejection_notice', 'transfer', 'post_out'],
  'allocations.past': ['access', 'view_letter'],
  'allocations.stamp-settings': ['access', 'add_stamp', 'edit', 'delete'],
  'directory': ['access', 'export_data'],
  'analytics': ['access'],
  'analytics.queue': ['access', 'export_report'],
  'analytics.pending': ['access', 'export_report'],
  'analytics.active-allocations': ['access', 'export_report'],
  'analytics.past-allocations': ['access', 'export_report'],
  'accommodation': ['access'],
  'accommodation.units': ['access', 'add_quarters', 'edit', 'delete', 'import', 'export', 'view_history', 'maintenance_request', 'inventory'],
  'accommodation.types': ['access', 'add_type', 'edit', 'delete'],
  'maintenance': ['access'],
  'maintenance.tasks': ['access', 'new_task', 'edit', 'delete', 'mark_complete'],
  'maintenance.requests': ['access', 'new_request', 'edit', 'delete', 'approve'],
  'administration': ['access'],
  'administration.users': ['access', 'create_user', 'edit_permissions', 'delete_user'],
  'administration.roles': ['access', 'create_role', 'edit', 'delete'],
  'administration.audit-logs': ['access', 'export_logs'],
  'administration.auth-info': ['access', 'manage_sessions']
} as const;

export type PageKey = keyof typeof PAGE_ACTIONS;
export type ActionType = typeof PAGE_ACTIONS[PageKey][number];

interface UserPermissions {
  pageKey: string;
  allowedActions: string[];
}

/**
 * Hook to check user permissions for specific pages and actions
 * 
 * @example
 * const { hasPermission, canAccess, canEdit, canDelete } = usePermissions();
 * 
 * // Check specific action
 * if (hasPermission('queue.list', 'add_queue')) {
 *   // Show Add Queue button
 * }
 * 
 * // Check common actions
 * if (canEdit('queue.list')) {
 *   // Show Edit button
 * }
 */
export function usePermissions() {
  const { user } = useAuth();
  
  // Get user's page permissions
  const userPermissions: Record<string, string[]> = {};
  
  if (user?.profile?.pagePermissions) {
    user.profile.pagePermissions.forEach((perm: any) => {
      userPermissions[perm.pageKey] = perm.allowedActions || [];
    });
  }

  /**
   * Check if user has a specific permission for a page
   */
  const hasPermission = (pageKey: PageKey, action: ActionType): boolean => {
    // Superadmins have all permissions
    if (user?.profile?.role === 'superadmin') {
      return true;
    }
    
    const pagePermissions = userPermissions[pageKey] || [];
    return pagePermissions.includes(action);
  };

  /**
   * Check if user can access a page
   */
  const canAccess = (pageKey: PageKey): boolean => {
    return hasPermission(pageKey, 'access');
  };

  /**
   * Check if user can edit on a page
   */
  const canEdit = (pageKey: PageKey): boolean => {
    return hasPermission(pageKey, 'edit');
  };

  /**
   * Check if user can delete on a page
   */
  const canDelete = (pageKey: PageKey): boolean => {
    return hasPermission(pageKey, 'delete');
  };

  /**
   * Check if user can perform specific queue actions
   */
  const canAddQueue = (): boolean => hasPermission('queue.list', 'add_queue');
  const canAllocate = (): boolean => hasPermission('queue.list', 'allocate');
  const canExportQueue = (): boolean => hasPermission('queue.list', 'export');

  /**
   * Check if user can perform specific allocation actions
   */
  const canApprove = (pageKey: 'allocations.pending' | 'maintenance.requests' = 'allocations.pending'): boolean => {
    return hasPermission(pageKey, 'approve');
  };
  
  const canRefuse = (): boolean => hasPermission('allocations.pending', 'refuse');
  const canViewLetter = (pageKey: 'allocations.pending' | 'allocations.active' | 'allocations.past'): boolean => {
    return hasPermission(pageKey, 'view_letter');
  };
  
  const canTransfer = (): boolean => hasPermission('allocations.active', 'transfer');
  const canPostOut = (): boolean => hasPermission('allocations.active', 'post_out');
  const canEjectionNotice = (): boolean => hasPermission('allocations.active', 'ejection_notice');

  /**
   * Check if user can perform specific accommodation actions
   */
  const canAddQuarters = (pageKey: 'queue.units' | 'accommodation.units' = 'accommodation.units'): boolean => {
    return hasPermission(pageKey, 'add_quarters');
  };
  
  const canImport = (): boolean => hasPermission('accommodation.units', 'import');
  const canExportAccommodation = (): boolean => hasPermission('accommodation.units', 'export');
  const canViewHistory = (): boolean => hasPermission('accommodation.units', 'view_history');
  const canMaintenanceRequest = (): boolean => hasPermission('accommodation.units', 'maintenance_request');
  const canInventory = (): boolean => hasPermission('accommodation.units', 'inventory');

  /**
   * Check if user can perform specific maintenance actions
   */
  const canNewTask = (): boolean => hasPermission('maintenance.tasks', 'new_task');
  const canMarkComplete = (): boolean => hasPermission('maintenance.tasks', 'mark_complete');
  const canNewRequest = (): boolean => hasPermission('maintenance.requests', 'new_request');

  /**
   * Check if user can perform specific admin actions
   */
  const canCreateUser = (): boolean => hasPermission('administration.users', 'create_user');
  const canEditPermissions = (): boolean => hasPermission('administration.users', 'edit_permissions');
  const canDeleteUser = (): boolean => hasPermission('administration.users', 'delete_user');
  const canManageSessions = (): boolean => hasPermission('administration.auth-info', 'manage_sessions');
  const canExportLogs = (): boolean => hasPermission('administration.audit-logs', 'export_logs');

  /**
   * Check if user can perform any action on a page (beyond just access)
   */
  const hasAnyAction = (pageKey: PageKey): boolean => {
    const pagePermissions = userPermissions[pageKey] || [];
    const availableActions = PAGE_ACTIONS[pageKey] || [];
    
    // Check if user has any action beyond just 'access'
    return availableActions.some(action => 
      action !== 'access' && pagePermissions.includes(action)
    );
  };

  /**
   * Get all permissions for a specific page
   */
  const getPagePermissions = (pageKey: PageKey): string[] => {
    return userPermissions[pageKey] || [];
  };

  /**
   * Get user's role
   */
  const getUserRole = (): string => {
    return user?.profile?.role || 'user';
  };

  /**
   * Check if user is admin or above
   */
  const isAdmin = (): boolean => {
    const role = getUserRole();
    return ['admin', 'superadmin'].includes(role);
  };

  /**
   * Check if user is superadmin
   */
  const isSuperAdmin = (): boolean => {
    return getUserRole() === 'superadmin';
  };

  return {
    // Core permission checking
    hasPermission,
    canAccess,
    canEdit,
    canDelete,
    
    // Queue specific
    canAddQueue,
    canAllocate,
    canExportQueue,
    
    // Allocation specific
    canApprove,
    canRefuse,
    canViewLetter,
    canTransfer,
    canPostOut,
    canEjectionNotice,
    
    // Accommodation specific
    canAddQuarters,
    canImport,
    canExportAccommodation,
    canViewHistory,
    canMaintenanceRequest,
    canInventory,
    
    // Maintenance specific
    canNewTask,
    canMarkComplete,
    canNewRequest,
    
    // Admin specific
    canCreateUser,
    canEditPermissions,
    canDeleteUser,
    canManageSessions,
    canExportLogs,
    
    // Utility functions
    hasAnyAction,
    getPagePermissions,
    getUserRole,
    isAdmin,
    isSuperAdmin,
    
    // Raw permissions data
    userPermissions
  };
}

/**
 * Higher-order component to wrap components that need permission checking
 */
export function withPermissions<T extends object>(
  Component: React.ComponentType<T>,
  requiredPageKey: PageKey,
  requiredAction: ActionType = 'access'
) {
  return function PermissionWrapper(props: T) {
    const { hasPermission } = usePermissions();
    
    if (!hasPermission(requiredPageKey, requiredAction)) {
      return React.createElement(
        'div',
        { className: 'flex items-center justify-center p-8' },
        React.createElement(
          'div',
          { className: 'text-center space-y-2' },
          React.createElement('p', { className: 'text-lg font-semibold' }, 'Access Denied'),
          React.createElement(
            'p',
            { className: 'text-muted-foreground' },
            `You don't have permission to ${requiredAction} this page.`
          )
        )
      );
    }
    
    return React.createElement(Component, props);
  };
}
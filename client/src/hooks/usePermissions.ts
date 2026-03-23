import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole, SubscriptionTier } from '../../../shared/types';

interface Permissions {
  // Role checks
  isUser: boolean;
  isLandlord: boolean;
  isBroker: boolean;
  isAdmin: boolean;
  
  // Feature permissions
  canPost: boolean;
  canManageBuildings: boolean;
  canManageRooms: boolean;
  canGenerateQR: boolean;
  canManageContracts: boolean;
  canViewReports: boolean;
  canVerifyListings: boolean;
  canManageUsers: boolean;
  
  // Subscription-based
  hasDashboard: boolean;
  hasFullDashboard: boolean;
  hasCRM: boolean;
  
  // Utility
  hasRole: (...roles: UserRole[]) => boolean;
  hasTier: (...tiers: SubscriptionTier[]) => boolean;
}

/**
 * Hook for checking user permissions throughout the app.
 * Centralizes all permission logic in one place.
 */
export function usePermissions(): Permissions {
  const { role, subscription } = useAuth();

  return useMemo(() => {
    const isUser = role === 'user';
    const isLandlord = role === 'landlord';
    const isBroker = role === 'broker';
    const isAdmin = role === 'admin';

    const isOwnerOrBroker = isLandlord || isBroker;
    const isPrivileged = isOwnerOrBroker || isAdmin;

    return {
      // Role checks
      isUser,
      isLandlord,
      isBroker,
      isAdmin,

      // Feature permissions
      canPost: isPrivileged,
      canManageBuildings: isPrivileged,
      canManageRooms: isPrivileged,
      canGenerateQR: isLandlord || isAdmin, // exclusive to landlord package
      canManageContracts: isPrivileged,
      canViewReports: isPrivileged,
      canVerifyListings: isAdmin,
      canManageUsers: isAdmin,

      // Subscription-based
      hasDashboard: isPrivileged,
      hasFullDashboard: isLandlord || isAdmin || subscription === 'broker_pro',
      hasCRM: isLandlord || isAdmin || ['broker_basic', 'broker_pro'].includes(subscription),

      // Utility
      hasRole: (...roles: UserRole[]) => roles.includes(role),
      hasTier: (...tiers: SubscriptionTier[]) => tiers.includes(subscription),
    };
  }, [role, subscription]);
}

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { canAccessCMS, hasPermission, type UserRole } from '@/lib/constants/roles';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requiredPermission?: string;
  fallbackPath?: string;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  requiredRole,
  requiredPermission,
  fallbackPath = '/unauthorized'
}) => {
  const { user, isAuthenticated } = useAuth();

  // Check if user is authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user can access CMS
  if (!canAccessCMS(user.role as UserRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check specific role requirement
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Check specific permission requirement
  if (requiredPermission && !hasPermission(user.role as UserRole, requiredPermission)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

// Specific role guards for convenience
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleGuard requiredRole="admin">{children}</RoleGuard>
);

export const MerchantRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleGuard requiredRole="merchant">{children}</RoleGuard>
);

// Permission-based guards
export const StoreManagementRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleGuard requiredPermission="stores">{children}</RoleGuard>
);

export const UserManagementRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleGuard requiredPermission="users">{children}</RoleGuard>
);

export const ProductManagementRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleGuard requiredPermission="products">{children}</RoleGuard>
);

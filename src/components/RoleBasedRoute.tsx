import { useAuth } from '@/contexts/AuthContext'
import { Navigate, useLocation } from 'react-router-dom'

interface RoleBasedRouteProps {
  children: React.ReactNode
  allowedRoles: ('admin' | 'merchant' | 'customer')[]
  fallbackPath?: string
}

export function RoleBasedRoute({ 
  children, 
  allowedRoles, 
  fallbackPath = '/unauthorized' 
}: RoleBasedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check if user has required role
  if (user && !allowedRoles.includes(user.role)) {
    return <Navigate to={fallbackPath} replace />
  }

  // Render children if all checks pass
  return <>{children}</>
}

// Convenience components for specific roles
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <RoleBasedRoute allowedRoles={['admin']}>
      {children}
    </RoleBasedRoute>
  )
}

export function MerchantRoute({ children }: { children: React.ReactNode }) {
  return (
    <RoleBasedRoute allowedRoles={['merchant', 'admin']}>
      {children}
    </RoleBasedRoute>
  )
}

export function CustomerRoute({ children }: { children: React.ReactNode }) {
  return (
    <RoleBasedRoute allowedRoles={['customer', 'admin']}>
      {children}
    </RoleBasedRoute>
  )
}

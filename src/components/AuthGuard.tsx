import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface AuthGuardProps {
  children: ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

export function AuthGuard({ 
  children, 
  requireAuth = true, 
  redirectTo = '/login' 
}: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        // Save the attempted location for redirect after login
        const from = location.pathname + location.search
        navigate(redirectTo, { 
          replace: true, 
          state: { from } 
        })
      } else if (!requireAuth && isAuthenticated) {
        // If user is authenticated but trying to access auth pages (like login)
        // redirect them to dashboard
        navigate('/dashboard', { replace: true })
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, navigate, redirectTo, location])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // If auth is required and user is not authenticated, don't render children
  // (they will be redirected by the useEffect above)
  if (requireAuth && !isAuthenticated) {
    return null
  }

  // If auth is not required but user is authenticated, don't render children
  // (they will be redirected by the useEffect above)
  if (!requireAuth && isAuthenticated) {
    return null
  }

  return <>{children}</>
}

import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react'
import { authApi, storeApi, tokenStorage, type User, type Store } from '@/lib/api'

// Types
export interface AuthContextType {
  user: User | null
  userStore: Store | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  clearError: () => void
  refreshUserStore: () => Promise<void>
  hasValidStore: boolean
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userStore, setUserStore] = useState<Store | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check if user has a valid store (for merchants)
  const hasValidStore = useMemo(() => {
    if (!user || user.role !== 'merchant') return true // Non-merchants don't need store
    return !!(userStore && userStore.status === 'active' && user.merchantInfo?.storeId === userStore._id)
  }, [user, userStore])

  // Fetch user's store information (for merchants)
  const refreshUserStore = async () => {
    if (!user || user.role !== 'merchant' || !user.merchantInfo?.storeId) {
      setUserStore(null)
      return
    }

    try {
      const response = await storeApi.getStore(user.merchantInfo.storeId)
      if (response.success && response.data?.data) {
        setUserStore(response.data.data)
      } else {
        console.warn('Failed to fetch user store:', response.message)
        setUserStore(null)
      }
    } catch (error: any) {
      console.error('Error fetching user store:', error)
      setUserStore(null)
    }
  }

  // Check for stored auth on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = tokenStorage.getUser()
        const accessToken = tokenStorage.getAccessToken()
        
        if (storedUser && accessToken) {
          // Verify token with server
          try {
            const response = await authApi.getCurrentUser()
            if (response.status === 'success' && response.data?.user) {
              setUser(response.data.user)
              tokenStorage.setUser(response.data.user)
              
              // Fetch store info for merchants
              if (response.data.user.role === 'merchant' && response.data.user.merchantInfo?.storeId) {
                await refreshUserStore()
              }
            } else {
              // Invalid stored data, clear it
              console.log('Token invalid, clearing stored auth data')
              tokenStorage.clearTokens()
              setUser(null)
              setUserStore(null)
            }
          } catch (error: any) {
            console.error('Token verification failed:', error)
            
            // If token is expired/invalid, clear auth data and redirect to login
            if (error?.status === 401 || error?.message?.includes('401')) {
              console.log('Access token expired, clearing auth data')
              tokenStorage.clearTokens()
              setUser(null)
              setUserStore(null)
            } else {
              // For other errors, also clear auth data
              tokenStorage.clearTokens()
              setUser(null)
              setUserStore(null)
            }
          }
        } else {
          // No stored auth data
          setUser(null)
          setUserStore(null)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        tokenStorage.clearTokens()
        setUser(null)
        setUserStore(null)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await authApi.login({ email, password })
      
      if (response.status === 'success' && response.data?.user) {
        setUser(response.data.user)
        
        // Fetch store info for merchants
        if (response.data.user.role === 'merchant' && response.data.user.merchantInfo?.storeId) {
          await refreshUserStore()
        }
        
        setIsLoading(false)
        return true
      } else {
        setError(response.message || 'Login failed')
        setIsLoading(false)
        return false
      }
    } catch (error: any) {
      console.error('Login error:', error)
      let errorMessage = 'Login failed. Please check your credentials.'
      
      // Handle specific error types
      if (error.status === 401) {
        errorMessage = 'Invalid email or password.'
      } else if (error.status === 429) {
        errorMessage = 'Too many login attempts. Please try again later.'
      } else if (error.status >= 500) {
        errorMessage = 'Server error. Please try again later.'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setError(errorMessage)
      setIsLoading(false)
      return false
    }
  }

  // Logout function
  const logout = async (): Promise<void> => {
    setIsLoading(true)
    try {
      await authApi.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setUserStore(null)
      setIsLoading(false)
    }
  }

  // Clear error function
  const clearError = () => {
    setError(null)
  }

  const value: AuthContextType = {
    user,
    userStore,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user,
    error,
    clearError,
    refreshUserStore,
    hasValidStore
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { authApi, tokenStorage, type User } from '@/lib/api'

// Types
export interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  clearError: () => void
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
            } else {
              // Invalid stored data, clear it
              console.log('Token invalid, clearing stored auth data')
              tokenStorage.clearTokens()
              setUser(null)
            }
          } catch (error) {
            console.error('Token verification failed:', error)
            tokenStorage.clearTokens()
            setUser(null)
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        tokenStorage.clearTokens()
        setUser(null)
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
        setIsLoading(false)
        return true
      } else {
        setError(response.message || 'Login failed')
        setIsLoading(false)
        return false
      }
    } catch (error: any) {
      console.error('Login error:', error)
      setError(error.message || 'Login failed. Please check your credentials.')
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
      setIsLoading(false)
    }
  }

  // Clear error function
  const clearError = () => {
    setError(null)
  }

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user,
    error,
    clearError
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

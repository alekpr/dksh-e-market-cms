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
  refreshUserStore: (userParam?: User) => Promise<void>
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
    
    // A merchant has a valid store if either:
    // 1. userStore exists and is active, OR
    // 2. merchantInfo.storeId exists (store still loading or being activated)
    const storeIdPresent = !!user.merchantInfo?.storeId;
    const storeLoaded = !!userStore;
    const storeActive = storeLoaded && userStore.status === 'active';
    
    // Allow access if store ID exists in merchantInfo, even if store isn't loaded yet
    // This prevents flickering of "No Store Access" during loading
    const hasStore = storeActive || (!storeLoaded && storeIdPresent);
    
    console.log('Store validation check:', { 
      hasStore, 
      storeIdPresent,
      storeLoaded,
      storeActive,
      userStoreId: userStore?._id, 
      merchantInfoStoreId: user.merchantInfo?.storeId,
      userStoreStatus: userStore?.status
    });
    
    return hasStore;
  }, [user, userStore])

  // Fetch user's store information (for merchants)
  const refreshUserStore = async (userParam?: User) => {
    console.log('🔄 refreshUserStore function called');
    
    const currentUser = userParam || user;
    
    if (!currentUser || currentUser.role !== 'merchant') {
      console.log('❌ User is not a merchant, skipping store fetch. User details:', {
        exists: !!currentUser,
        role: currentUser?.role,
        email: currentUser?.email
      });
      setUserStore(null)
      return
    }

    try {
      let storeFound = false;
      
      console.log('🔄 refreshUserStore called for user:', {
        id: currentUser._id,
        email: currentUser.email,
        role: currentUser.role,
        merchantInfo: currentUser.merchantInfo || 'none'
      });
      
      // Check token before making any requests
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.error('❌ No access token found for API requests!');
        return;
      }
      console.log(`🔑 Using token: ${token.substring(0, 10)}...`);
      
      // Try three different approaches to maximize chances of success
      
      // First attempt: Try the my-store endpoint
      try {
        console.log('🔍 Attempt 1: Fetching merchant store using /my-store endpoint')
        const myStoreResponse = await storeApi.getCurrentUserStore()
        console.log('📦 Raw /my-store response:', myStoreResponse);
        
        if (myStoreResponse.success && myStoreResponse.data) {
          console.log('✅ Successfully fetched merchant store from /my-store:', myStoreResponse.data)
          setUserStore(myStoreResponse.data)
          storeFound = true;
        } else {
          console.warn('⚠️ API call succeeded but store data is missing:', myStoreResponse);
        }
      } catch (error) {
        const myStoreError: any = error;
        console.error('❌ Failed to fetch from /my-store endpoint:', myStoreError)
        console.error('🧨 Error details:', { 
          status: myStoreError?.status,
          message: myStoreError?.message,
          data: myStoreError?.data
        });
      }
      
      // Second attempt: Try the /merchant endpoint (alternative path to same controller)
      if (!storeFound) {
        try {
          console.log('🔍 Attempt 2: Fetching merchant store using /stores/merchant endpoint')
          
          // Direct fetch to bypass the storeApi abstraction, just to rule out any issues there
          const merchantResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://54.251.126.43:3000/api/v1'}/stores/merchant`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          const merchantData = await merchantResponse.json();
          console.log('📦 Raw /merchant endpoint response:', merchantData);
          
          if (merchantData.success && merchantData.data) {
            console.log('✅ Successfully fetched merchant store from /merchant endpoint:', merchantData.data)
            setUserStore(merchantData.data)
            storeFound = true;
          } else {
            console.warn('⚠️ Merchant endpoint call succeeded but data is missing', merchantData);
          }
        } catch (merchantError: any) {
          console.error('❌ Failed to fetch from /merchant endpoint:', merchantError)
        }
      }
      
      // Third attempt: If previous attempts failed and we have a store ID, try fetching directly
      if (!storeFound && currentUser.merchantInfo?.storeId) {
        try {
          console.log('🔍 Attempt 3: Fetching store by ID from merchantInfo:', currentUser.merchantInfo.storeId)
          const response = await storeApi.getStore(currentUser.merchantInfo.storeId)
          
          if (response.success && response.data) {
            console.log('✅ Successfully fetched store by ID:', response.data)
            setUserStore(response.data)
            storeFound = true;
          } else {
            console.warn('⚠️ Store not found by ID:', currentUser.merchantInfo.storeId)
          }
        } catch (idError: any) {
          console.error('❌ Error fetching store by ID:', idError)
          console.error('🧨 Error details:', {
            status: idError?.status,
            message: idError?.message,
            data: idError?.data
          });
        }
      }
      
      // Fourth attempt: If all previous attempts failed, try the debug endpoint
      if (!storeFound) {
        try {
          console.log('🔍 Attempt 4: Using debug endpoint as last resort')
          const debugResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://54.251.126.43:3000/api/v1'}/debug/fix-store`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          
          const debugData = await debugResponse.json();
          console.log('📦 Debug endpoint response:', debugData);
          
          if (debugData.success) {
            console.log('✅ Successfully fixed store relationship via debug endpoint');
            
            // Retry the my-store endpoint after fixing
            const retryResponse = await storeApi.getCurrentUserStore();
            if (retryResponse.success && retryResponse.data) {
              console.log('✅ Successfully fetched store after fix:', retryResponse.data);
              setUserStore(retryResponse.data);
              storeFound = true;
            }
          }
        } catch (debugError) {
          console.error('❌ Failed to use debug endpoint:', debugError);
        }
      }
      
      // If all attempts failed, set userStore to null
      if (!storeFound) {
        console.warn('❌ Could not find any store for this merchant user after multiple attempts')
        setUserStore(null)
      }
    } catch (error: any) {
      console.error('❌ Critical error in refreshUserStore:', error)
      console.error('❌ Error stack:', error.stack)
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
              if (response.data.user.role === 'merchant') {
                console.log('🚀 Calling refreshUserStore for merchant user:', response.data.user.email);
                await refreshUserStore(response.data.user)
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
        if (response.data.user.role === 'merchant') {
          console.log('🚀 Calling refreshUserStore after login for merchant:', response.data.user.email);
          console.log('🚀 About to call refreshUserStore function...');
          await refreshUserStore(response.data.user)
          console.log('🚀 refreshUserStore function completed');
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

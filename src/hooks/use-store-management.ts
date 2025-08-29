import { useState, useEffect } from 'react'
import { storeApi, type Store } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export interface UseStoreManagementResult {
  store: Store | null
  loading: boolean
  error: string | null
  refreshStore: () => Promise<void>
  hasStoreAccess: boolean
  isStoreActive: boolean
}

export function useStoreManagement(): UseStoreManagementResult {
  const { user, userStore, hasValidStore, refreshUserStore } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if user has store access
  const hasStoreAccess = hasValidStore && !!userStore

  // Check if store is active
  const isStoreActive = hasStoreAccess && userStore?.status === 'active'

  // Refresh store information
  const refreshStore = async () => {
    if (!user || user.role !== 'merchant') {
      setError('Only merchants can access store information')
      return
    }

    if (!user.merchantInfo?.storeId) {
      setError('No store associated with this account')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await refreshUserStore()
    } catch (error: any) {
      console.error('Failed to refresh store:', error)
      const errorMessage = error.message || 'Failed to load store information'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Load store on mount if needed
  useEffect(() => {
    if (user?.role === 'merchant' && user.merchantInfo?.storeId && !userStore && !loading) {
      refreshStore()
    }
  }, [user, userStore])

  return {
    store: userStore,
    loading,
    error,
    refreshStore,
    hasStoreAccess,
    isStoreActive
  }
}

export default useStoreManagement

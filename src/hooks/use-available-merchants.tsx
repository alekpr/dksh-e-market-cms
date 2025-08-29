import { useState, useEffect } from 'react'
import { apiClient, type User } from '../lib/api'

export interface AvailableMerchant {
  id: string
  name: string
  email: string
  hasStore: boolean
}

export function useAvailableMerchants() {
  const [merchants, setMerchants] = useState<AvailableMerchant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAvailableMerchants = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔍 Fetching merchants and stores...')

      // Fetch all merchants
      const usersResponse = await apiClient.get('/users?role=merchant')
      console.log('📥 Users API response:', usersResponse)
      
      const merchantUsers = (usersResponse.data as any)?.data as User[] || []
      console.log('👥 Merchant users:', merchantUsers)

      // Fetch all stores to check which merchants already have stores
      const storesResponse = await apiClient.get('/stores')
      console.log('📥 Stores API response:', storesResponse)
      
      const stores = (storesResponse.data as any)?.data || []
      console.log('🏪 Stores:', stores)
      
      // Get list of owner IDs who already have stores
      const ownersWithStores = new Set(
        stores.map((store: any) => store.ownerId || store.owner_id || store.owner?.id).filter(Boolean)
      )
      console.log('🔒 Owners with stores:', ownersWithStores)

      // Create merchant list with hasStore flag
      const allMerchants: AvailableMerchant[] = merchantUsers.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        hasStore: ownersWithStores.has(user._id)
      }))
      
      console.log('✅ All merchants with store status:', allMerchants)
      setMerchants(allMerchants)
    } catch (err) {
      console.error('❌ Error fetching available merchants:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch available merchants')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAvailableMerchants()
  }, [])

  // Filter to only show merchants without stores
  const availableMerchants = merchants.filter(merchant => !merchant.hasStore)

  return {
    merchants: availableMerchants,
    allMerchants: merchants,
    loading,
    error,
    refetch: fetchAvailableMerchants
  }
}

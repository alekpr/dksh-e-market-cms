import { useState, useEffect } from 'react'
import { apiClient } from '../lib/api'

export interface AvailableMerchant {
  id: string
  name: string
  email: string
}

export function useAvailableMerchants() {
  const [merchants, setMerchants] = useState<AvailableMerchant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAvailableMerchants = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log('🔄 Starting to fetch available merchants...')

        // Get all users with merchant role
        console.log('📋 Fetching all merchant users...')
        const usersResponse = await apiClient.get('/users?role=merchant')
        
        if (!usersResponse.success) {
          console.error('❌ Failed to fetch users:', usersResponse.message)
          throw new Error(`Failed to fetch users: ${usersResponse.message}`)
        }

        const allMerchants: any[] = Array.isArray(usersResponse.data) ? usersResponse.data : []
        console.log('📊 Total merchants found:', allMerchants.length)

        // Get all stores to check which merchants already have stores
        console.log('🏪 Fetching all stores...')
        const storesResponse = await apiClient.get('/stores')
        
        if (!storesResponse.success) {
          console.error('❌ Failed to fetch stores:', storesResponse.message)
          throw new Error(`Failed to fetch stores: ${storesResponse.message}`)
        }

        const allStores: any[] = Array.isArray(storesResponse.data) ? storesResponse.data : []
        console.log('📊 Total stores found:', allStores.length)

        // Get list of owner IDs that already have stores
        const ownersWithStores = new Set(allStores.map((store: any) => store.owner?._id).filter(Boolean))
        console.log('🏪 Owners with stores:', Array.from(ownersWithStores))

        // Filter merchants who don't have stores yet
        const availableMerchants = allMerchants.filter((merchant: any) => !ownersWithStores.has(merchant._id))
        console.log('✅ Available merchants (without stores):', availableMerchants.length)

        // Transform to the expected format
        const transformedMerchants: AvailableMerchant[] = availableMerchants.map((merchant: any) => ({
          id: merchant._id,
          name: merchant.name,
          email: merchant.email
        }))

        console.log('🎯 Final available merchants:', transformedMerchants)
        setMerchants(transformedMerchants)

      } catch (error) {
        console.error('❌ Error fetching available merchants:', error)
        setError(error instanceof Error ? error.message : 'Failed to fetch available merchants')
      } finally {
        setLoading(false)
      }
    }

    fetchAvailableMerchants()
  }, [])

  return { merchants, loading, error }
}

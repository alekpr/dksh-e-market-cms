// Analytics API helper with automatic role-based endpoint selection
import { useAuth } from '@/contexts/AuthContext'

interface ApiConfig {
  baseUrl: string
  headers: Record<string, string>
}

export const useAnalyticsApi = () => {
  const { user } = useAuth()

  const getApiConfig = (): ApiConfig => {
    const token = localStorage.getItem('auth_token')
    const baseHeaders: Record<string, string> = {
      'Content-Type': 'application/json'
    }

    // Determine API base URL based on user role
    let baseUrl = '/api/v1/analytics'
    
    if (user?.role === 'merchant') {
      baseUrl = '/api/v1/analytics/merchant'
      if (token) {
        baseHeaders['Authorization'] = `Bearer ${token}`
      }
    }

    return { baseUrl, headers: baseHeaders }
  }

  const fetchAnalyticsData = async (endpoint: string, params: Record<string, string> = {}) => {
    const { baseUrl, headers } = getApiConfig()
    
    // Build query string
    const queryParams = new URLSearchParams(params)
    const url = `${baseUrl}/${endpoint}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    
    console.log(`Analytics API call for ${user?.role}:`, url)
    
    try {
      const response = await fetch(url, { headers })
      
      if (!response.ok) {
        throw new Error(`${endpoint}: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error(`Analytics API error for ${endpoint}:`, error)
      throw error
    }
  }

  return {
    getApiConfig,
    fetchAnalyticsData,
    isAuthenticated: user?.role === 'merchant' && !!localStorage.getItem('auth_token'),
    userRole: user?.role,
    apiMode: user?.role === 'merchant' ? 'Merchant (Store-Filtered)' : 'Platform-Wide'
  }
}

// Analytics data fetching hooks
export const useAnalyticsEndpoints = (period: string = '30d') => {
  const { fetchAnalyticsData } = useAnalyticsApi()

  const fetchAllAnalytics = async () => {
    const endpoints = [
      { key: 'bestSellers', endpoint: 'best-sellers' },
      { key: 'trending', endpoint: 'trending' },
      { key: 'summary', endpoint: 'summary' },
      { key: 'topRated', endpoint: 'top-rated' },
      { key: 'users', endpoint: 'users' },
      { key: 'inventory', endpoint: 'inventory' },
      { key: 'financial', endpoint: 'financial' },
      { key: 'performance', endpoint: 'performance' }
    ]

    const promises = endpoints.map(({ endpoint }) =>
      fetchAnalyticsData(endpoint, { period })
        .then(data => ({ success: true, data: data.data }))
        .catch(error => ({ success: false, data: null, error: error.message }))
    )

    const results = await Promise.all(promises)
    
    return endpoints.reduce((acc, { key }, index) => {
      acc[key] = results[index].data || (results[index].success ? [] : null)
      return acc
    }, {} as Record<string, any>)
  }

  return { fetchAllAnalytics }
}

// Utility to help debug authentication issues
export const checkAuthStatus = () => {
  const token = localStorage.getItem('access_token')
  const refreshToken = localStorage.getItem('refresh_token')
  const userStr = localStorage.getItem('user')
  
  let user = null
  try {
    user = userStr ? JSON.parse(userStr) : null
  } catch (e) {
    console.error('Error parsing user data:', e)
  }

  const status = {
    hasAccessToken: !!token,
    hasRefreshToken: !!refreshToken,
    hasUserData: !!user,
    userEmail: user?.email || null,
    userRole: user?.role || null,
    tokenPreview: token ? `${token.substring(0, 10)}...` : null
  }

  console.log('🔍 Authentication Status Check:', status)
  
  if (!token) {
    console.log('❌ No access token found - User needs to log in')
  } else if (!user) {
    console.log('⚠️ Token exists but no user data - May need to refresh')
  } else {
    console.log('✅ User appears to be authenticated:', user.email)
  }

  return status
}

// Quick function to test API authentication
export const testApiAuth = async () => {
  try {
    const token = localStorage.getItem('access_token')
    if (!token) {
      console.log('❌ No token available for API test')
      return { success: false, message: 'No authentication token' }
    }

    const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
    
    // Test with a simple protected endpoint
    const response = await fetch(`${apiUrl}/api/v1/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.ok) {
      const data = await response.json()
      console.log('✅ API authentication test successful:', data)
      return { success: true, data }
    } else {
      const errorData = await response.json().catch(() => ({}))
      console.log('❌ API authentication test failed:', response.status, errorData)
      return { success: false, status: response.status, error: errorData }
    }
  } catch (error) {
    console.error('❌ API authentication test error:', error)
    return { success: false, error }
  }
}

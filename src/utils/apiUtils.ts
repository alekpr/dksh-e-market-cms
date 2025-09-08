/**
 * Utility to clean up localStorage when switching API servers
 * This helps prevent 404 errors from cached product IDs, route params, etc.
 */

// Function to clear relevant localStorage data
export function clearServerData() {
  console.log('🧹 Clearing cached server data...')
  
  const keysToRemove = [
    'access_token',
    'refresh_token', 
    'user_data',
    'selected_product_id',
    'cart_data',
    'recent_products',
    'selected_store_id',
    'cms_cache'
  ]
  
  keysToRemove.forEach(key => {
    if (localStorage.getItem(key)) {
      console.log(`   ✅ Removed: ${key}`)
      localStorage.removeItem(key)
    }
  })
  
  // Clear sessionStorage as well
  const sessionKeysToRemove = [
    'current_product',
    'editing_product_id', 
    'temp_data'
  ]
  
  sessionKeysToRemove.forEach(key => {
    if (sessionStorage.getItem(key)) {
      console.log(`   ✅ Removed session: ${key}`)
      sessionStorage.removeItem(key)
    }
  })
  
  console.log('✅ Server data cleanup complete!')
  console.log('💡 Please refresh the page and login again')
}

// Function to show helpful info about API connection
export function showApiInfo() {
  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://54.251.126.43:3000'
  console.log('🌐 Current API Configuration:')
  console.log(`   Base URL: ${apiUrl}`)
  console.log(`   Full API URL: ${apiUrl}/api/v1`)
  
  // Test connectivity
  fetch(`${apiUrl}/api/v1/health`)
    .then(response => response.json())
    .then(data => {
      console.log('✅ API Health Check:', data)
    })
    .catch(error => {
      console.error('❌ API Health Check failed:', error)
    })
}

// Auto-run cleanup if called directly
if (typeof window !== 'undefined') {
  // Make functions available globally for easy console access
  ;(window as any).clearServerData = clearServerData
  ;(window as any).showApiInfo = showApiInfo
  
  console.log('🔧 API Utilities loaded!')
  console.log('   Run clearServerData() to clean cached data')
  console.log('   Run showApiInfo() to check API status')
}

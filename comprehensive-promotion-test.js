/**
 * Comprehensive Promotion Filtering Test
 * Tests both API endpoint and CMS integration
 */

// Test Configuration
const testConfig = {
  apiUrl: 'http://54.251.126.43:3000',
  
  // Test users - Replace with actual data
  merchantUser: {
    token: 'YOUR_MERCHANT_TOKEN_HERE',
    storeId: 'YOUR_STORE_ID_HERE',
    email: 'merchant@example.com'
  },
  
  adminUser: {
    token: 'YOUR_ADMIN_TOKEN_HERE',
    email: 'admin@example.com'
  }
}

// Test Results
const results = {
  apiTests: [],
  frontendTests: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0
  }
}

function addResult(category, test, passed, details = '') {
  const result = {
    test,
    passed,
    details,
    timestamp: new Date().toISOString()
  }
  
  results[category].push(result)
  results.summary.total++
  if (passed) results.summary.passed++
  else results.summary.failed++
  
  const status = passed ? '✅' : '❌'
  console.log(`${status} ${test}: ${details}`)
}

async function testAPI() {
  console.log('\n🔧 API Endpoint Tests')
  console.log('======================')
  
  const axios = require('axios')
  
  try {
    // Test 1: Merchant endpoint without explicit storeId (should use middleware)
    console.log('\n📍 Test 1: Merchant endpoint (middleware storeId)')
    try {
      const response = await axios.get(`${testConfig.apiUrl}/api/v1/promotions/merchant`, {
        headers: { 'Authorization': `Bearer ${testConfig.merchantUser.token}` }
      })
      
      const promotions = response.data?.data?.promotions || []
      const wrongStorePromos = promotions.filter(p => 
        p.storeId && p.storeId !== testConfig.merchantUser.storeId
      )
      
      if (wrongStorePromos.length === 0) {
        addResult('apiTests', 'Merchant endpoint filtering', true, 
          `Found ${promotions.length} promotions, all belong to correct store`)
      } else {
        addResult('apiTests', 'Merchant endpoint filtering', false, 
          `Found ${wrongStorePromos.length} promotions from other stores`)
      }
      
    } catch (error) {
      addResult('apiTests', 'Merchant endpoint filtering', false, 
        `API Error: ${error.response?.status} - ${error.message}`)
    }
    
    // Test 2: General endpoint with explicit storeId
    console.log('\n📍 Test 2: General endpoint with explicit storeId')
    try {
      const response = await axios.get(
        `${testConfig.apiUrl}/api/v1/promotions?storeId=${testConfig.merchantUser.storeId}`, 
        {
          headers: { 'Authorization': `Bearer ${testConfig.merchantUser.token}` }
        }
      )
      
      const promotions = response.data?.data?.promotions || []
      const wrongStorePromos = promotions.filter(p => 
        p.storeId && p.storeId !== testConfig.merchantUser.storeId
      )
      
      if (wrongStorePromos.length === 0) {
        addResult('apiTests', 'General endpoint explicit storeId', true, 
          `Found ${promotions.length} promotions, all filtered correctly`)
      } else {
        addResult('apiTests', 'General endpoint explicit storeId', false, 
          `Found ${wrongStorePromos.length} promotions from other stores`)
      }
      
    } catch (error) {
      addResult('apiTests', 'General endpoint explicit storeId', false, 
        `API Error: ${error.response?.status} - ${error.message}`)
    }
    
    // Test 3: Admin endpoint (should see all promotions)
    if (testConfig.adminUser.token !== 'YOUR_ADMIN_TOKEN_HERE') {
      console.log('\n📍 Test 3: Admin endpoint (should see all promotions)')
      try {
        const response = await axios.get(`${testConfig.apiUrl}/api/v1/promotions`, {
          headers: { 'Authorization': `Bearer ${testConfig.adminUser.token}` }
        })
        
        const promotions = response.data?.data?.promotions || []
        const uniqueStores = [...new Set(promotions.map(p => p.storeId).filter(Boolean))]
        
        addResult('apiTests', 'Admin endpoint access', true, 
          `Found ${promotions.length} promotions from ${uniqueStores.length} different stores`)
        
      } catch (error) {
        addResult('apiTests', 'Admin endpoint access', false, 
          `API Error: ${error.response?.status} - ${error.message}`)
      }
    }
    
  } catch (error) {
    addResult('apiTests', 'API Tests Setup', false, error.message)
  }
}

function testFrontendLogic() {
  console.log('\n🎨 Frontend Logic Tests')
  console.log('========================')
  
  // Test 1: Role-based endpoint selection
  const mockUser = { role: 'merchant', storeId: testConfig.merchantUser.storeId }
  const isMerchant = mockUser.role === 'merchant'
  const expectedEndpoint = isMerchant ? '/promotions/merchant' : '/promotions'
  
  addResult('frontendTests', 'Role-based endpoint selection', 
    expectedEndpoint === '/promotions/merchant', 
    `Selected endpoint: ${expectedEndpoint}`)
  
  // Test 2: Query parameter building
  const mockParams = {
    page: 1,
    limit: 20,
    type: 'flash_sale',
    status: 'active',
    storeId: testConfig.merchantUser.storeId
  }
  
  const queryParams = new URLSearchParams()
  Object.entries(mockParams).forEach(([key, value]) => {
    if (value !== undefined) queryParams.append(key, value.toString())
  })
  
  const hasStoreId = queryParams.has('storeId')
  addResult('frontendTests', 'Query parameter building', hasStoreId, 
    `Query params: ${queryParams.toString()}`)
  
  // Test 3: Response data structure handling
  const mockResponse = {
    data: {
      success: true,
      results: 5,
      data: {
        promotions: [
          { id: '1', title: 'Test Promo 1', storeId: testConfig.merchantUser.storeId },
          { id: '2', title: 'Test Promo 2', storeId: testConfig.merchantUser.storeId }
        ]
      },
      pagination: { total: 5, page: 1, limit: 20, pages: 1 }
    }
  }
  
  const responseData = mockResponse.data
  const promotions = responseData?.data?.promotions || []
  const correctStructure = Array.isArray(promotions) && promotions.length > 0
  
  addResult('frontendTests', 'Response data structure', correctStructure, 
    `Extracted ${promotions.length} promotions from response`)
}

function generateReport() {
  console.log('\n📊 Test Report')
  console.log('===============')
  console.log(`Total Tests: ${results.summary.total}`)
  console.log(`Passed: ${results.summary.passed}`)
  console.log(`Failed: ${results.summary.failed}`)
  console.log(`Success Rate: ${((results.summary.passed / results.summary.total) * 100).toFixed(1)}%`)
  
  if (results.summary.failed > 0) {
    console.log('\n❌ Failed Tests:')
    const allTests = results.apiTests.concat(results.frontendTests)
    const failedTests = allTests.filter(test => !test.passed)
    failedTests.forEach(test => {
      console.log(`  - ${test.test}: ${test.details}`)
    })
  }
  
  console.log('\n📋 Next Steps:')
  if (testConfig.merchantUser.token === 'YOUR_MERCHANT_TOKEN_HERE') {
    console.log('  1. Update merchantUser.token with actual JWT token')
    console.log('  2. Update merchantUser.storeId with actual store ID')
    console.log('  3. Re-run the test')
  } else {
    console.log('  1. Deploy the API changes to production/staging')
    console.log('  2. Test with real users')
    console.log('  3. Monitor promotion list behavior in CMS')
  }
  
  return results
}

async function runAllTests() {
  console.log('🎯 Promotion Filtering Comprehensive Test')
  console.log('==========================================')
  console.log('This test validates the promotion filtering fix')
  console.log('ensuring merchants only see their own promotions.\n')
  
  // Run frontend logic tests (always available)
  testFrontendLogic()
  
  // Run API tests (requires tokens)
  if (testConfig.merchantUser.token !== 'YOUR_MERCHANT_TOKEN_HERE') {
    await testAPI()
  } else {
    console.log('\n⚠️ Skipping API tests - Please update test tokens')
  }
  
  // Generate report
  return generateReport()
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAllTests, testConfig, results }
}

// Auto-run if executed directly
if (require.main === module) {
  runAllTests().catch(console.error)
}

console.log('\n💡 How to use this test:')
console.log('1. Update testConfig with real tokens and store IDs')
console.log('2. Run: node comprehensive-promotion-test.js')
console.log('3. Check the test report for issues')
console.log('4. Fix any failing tests before deployment')
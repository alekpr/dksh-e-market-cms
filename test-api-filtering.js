/**
 * Simple API test for promotion filtering
 * Direct HTTP call to test the API endpoint
 */
const http = require('http');

// Test configuration - Replace these with actual values
const API_HOST = '54.251.126.43';
const API_PORT = 3000;
const TEST_STORE_ID = '672b9d0c33cfb6dc7d4f9a46'; // Example store ID - replace with actual
const TEST_TOKEN = 'your-jwt-token-here'; // Replace with actual merchant token

function makeRequest(path, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_HOST,
      port: API_PORT,
      path: path,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: response
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function testPromotionFiltering() {
  console.log('🎯 Testing Promotion API Filtering');
  console.log('====================================');
  console.log(`API: http://${API_HOST}:${API_PORT}`);
  console.log(`Store ID: ${TEST_STORE_ID}\n`);

  try {
    // Test 1: Merchant endpoint (should use middleware storeId)
    console.log('=== Test 1: Merchant Endpoint ===');
    const merchantResponse = await makeRequest('/api/v1/promotions/merchant', TEST_TOKEN);
    
    console.log('Status:', merchantResponse.status);
    if (merchantResponse.status === 200) {
      console.log('Total promotions:', merchantResponse.data.results || 0);
      if (merchantResponse.data.data?.promotions) {
        const promotions = merchantResponse.data.data.promotions;
        console.log('First 3 promotions:');
        promotions.slice(0, 3).forEach((promo, i) => {
          console.log(`  ${i+1}. "${promo.title}" - Store: ${promo.storeId} - Status: ${promo.status}`);
        });
        
        // Check for wrong store promotions
        const wrongStore = promotions.filter(p => p.storeId && p.storeId !== TEST_STORE_ID);
        if (wrongStore.length > 0) {
          console.log(`❌ Found ${wrongStore.length} promotions from other stores!`);
        } else {
          console.log('✅ All promotions belong to the correct store');
        }
      }
    } else {
      console.log('Error:', merchantResponse.data);
    }

    // Test 2: General endpoint with explicit storeId
    console.log('\n=== Test 2: General Endpoint with StoreId ===');
    const generalResponse = await makeRequest(`/api/v1/promotions?storeId=${TEST_STORE_ID}`, TEST_TOKEN);
    
    console.log('Status:', generalResponse.status);
    if (generalResponse.status === 200) {
      console.log('Total promotions:', generalResponse.data.results || 0);
    } else {
      console.log('Error:', generalResponse.data);
    }

    // Test 3: General endpoint without storeId (should show all promotions)
    console.log('\n=== Test 3: General Endpoint without Filter ===');
    const allResponse = await makeRequest('/api/v1/promotions', TEST_TOKEN);
    
    console.log('Status:', allResponse.status);
    if (allResponse.status === 200) {
      console.log('Total promotions (all stores):', allResponse.data.results || 0);
    } else {
      console.log('Error:', allResponse.data);
    }

    console.log('\n✅ API Test Complete!');

  } catch (error) {
    console.error('❌ Test error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Hint: Make sure the API server is running');
    }
  }
}

// Instructions
console.log('📋 Before running this test:');
console.log('1. Update TEST_STORE_ID with a valid store ID');
console.log('2. Update TEST_TOKEN with a valid JWT token');
console.log('3. Make sure API server is running');
console.log('4. Run: node test-api-filtering.js\n');

// Run test if token is provided
if (TEST_TOKEN !== 'your-jwt-token-here') {
  testPromotionFiltering();
} else {
  console.log('⚠️ Please update TEST_TOKEN before running the test');
}
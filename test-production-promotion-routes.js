/**
 * 🧪 Test Production Server Promotion Routes
 * Check if merchant promotion routes are available on production
 */

import axios from 'axios';

const PRODUCTION_BASE_URL = 'http://54.251.126.43:3000/api/v1';

// Test credentials
const testUser = {
  email: 'merchant@dksh.com',
  password: 'merchant123'
};

const testEndpoints = async () => {
  try {
    console.log('🚀 Testing Production Server Promotion Routes\n');
    
    // 1. Login to get token
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post(`${PRODUCTION_BASE_URL}/auth/login`, testUser);
    
    console.log('Login response:', loginResponse.data);
    
    // Handle different response structures
    const isSuccess = loginResponse.data.status === 'success' || loginResponse.data.success;
    const responseToken = loginResponse.data.token || loginResponse.data.data?.token;
    const responseUser = loginResponse.data.data?.user || loginResponse.data.user;
    
    if (!isSuccess || !responseToken) {
      console.log('❌ Login failed:', loginResponse.data.message || 'No token received');
      return;
    }
    
    console.log(`✅ Login successful: ${responseUser.email} (role: ${responseUser.role})`);
    console.log(`🏪 Store: ${responseUser.merchantInfo?.storeName} (${responseUser.merchantInfo?.storeId})\n`);
    
    const headers = {
      'Authorization': `Bearer ${responseToken}`,
      'Content-Type': 'application/json'
    };
    
    // 2. Test endpoints
    const endpoints = [
      { 
        path: '/promotions', 
        desc: 'General Promotions (old endpoint)',
        expected: 'Should work but show all promotions'
      },
      { 
        path: '/promotions/merchant', 
        desc: 'Merchant Promotions (new endpoint)',
        expected: 'Should work and show only merchant promotions'
      },
      { 
        path: '/promotions/merchant/active', 
        desc: 'Merchant Active Promotions',
        expected: 'Should work with merchant filtering'
      },
      { 
        path: '/promotions/merchant/stats', 
        desc: 'Merchant Promotion Stats',
        expected: 'Should work with merchant filtering'
      }
    ];
    
    console.log('2️⃣ Testing API Endpoints...\n');
    
    for (const endpoint of endpoints) {
      try {
        console.log(`🔍 Testing: ${endpoint.desc}`);
        console.log(`   URL: ${PRODUCTION_BASE_URL}${endpoint.path}`);
        
        const response = await axios.get(`${PRODUCTION_BASE_URL}${endpoint.path}?limit=5`, { 
          headers,
          timeout: 10000 
        });
        
        // Check for success in different response formats
        const isResponseSuccess = response.data.success || response.data.status === 'success';
        
        if (isResponseSuccess) {
          const data = response.data.data;
          const count = data.promotions?.length || data.results || 0;
          console.log(`   ✅ SUCCESS: ${count} items returned`);
          console.log(`   📊 Pagination: ${JSON.stringify(response.data.pagination || 'No pagination')}`);
          
          // Check store filtering
          if (data.promotions && Array.isArray(data.promotions)) {
            const storeIds = [...new Set(data.promotions.map(p => p.storeId).filter(Boolean))];
            console.log(`   🏪 Store IDs found: ${storeIds.join(', ') || 'None'}`);
            
            if (endpoint.path.includes('merchant') && storeIds.length > 1) {
              console.log(`   ⚠️  WARNING: Multiple stores found in merchant endpoint!`);
            }
          }
        } else {
          console.log(`   ❌ API Error: ${response.data.message || 'Unknown error'}`);
          console.log(`   📄 Full response:`, response.data);
        }
        
      } catch (error) {
        if (error.response) {
          console.log(`   ❌ HTTP ${error.response.status}: ${error.response.data?.message || error.message}`);
          
          if (error.response.status === 404) {
            console.log(`   💡 Route not found - might not be deployed yet`);
          } else if (error.response.status === 500) {
            console.log(`   💡 Server error - check backend logs`);
          }
        } else {
          console.log(`   ❌ Network Error: ${error.message}`);
        }
      }
      
      console.log(''); // Empty line for readability
    }
    
    // 3. Summary
    console.log('📋 Summary:');
    console.log('✅ If "/promotions/merchant" works = New routes deployed');
    console.log('❌ If "/promotions/merchant" gives 404 = Need to deploy backend');
    console.log('⚠️  If merchant routes show multiple stores = Security issue');
    console.log('\n💡 Expected: Merchant should only see their own store promotions');
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
};

// Run the test
testEndpoints();

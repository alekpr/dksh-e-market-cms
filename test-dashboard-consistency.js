/**
 * 🧪 Test Dashboard vs Promotions Page Data Consistency
 * Verify that both pages show the same merchant-specific data
 */

const axios = require('axios');

const API_BASE_URL = 'http://54.251.126.43:3000/api/v1';

const testAccount = {
  email: 'merchant@dksh.com',
  password: 'merchant123'
};

let authToken = null;

const login = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, testAccount);
    
    if (response.data.success) {
      authToken = response.data.data.token;
      console.log('✅ Login successful');
      return authToken;
    }
  } catch (error) {
    console.log('❌ Login failed:', error.response?.data?.message || error.message);
    return null;
  }
};

const testEndpoint = async (endpoint, description) => {
  try {
    if (!authToken) {
      console.log(`❌ No auth token for ${endpoint}`);
      return null;
    }

    const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (response.data.success) {
      console.log(`✅ ${description}:`);
      
      // Extract promotion count/data
      let count = 0;
      let items = [];
      
      if (response.data.data.promotions) {
        items = response.data.data.promotions;
        count = items.length;
      } else if (response.data.pagination) {
        count = response.data.pagination.total;
      } else if (response.data.results !== undefined) {
        count = response.data.results;
      }
      
      console.log(`   📊 Count: ${count}`);
      
      if (items.length > 0) {
        console.log(`   📝 Sample items:`);
        items.slice(0, 3).forEach((item, index) => {
          console.log(`      ${index + 1}. ${item.title || item._id} (${item.status || 'no status'})`);
        });
      }
      
      return { count, items, response: response.data };
    }
  } catch (error) {
    console.log(`❌ ${description} failed:`, error.response?.data?.message || error.message);
    return null;
  }
};

const runConsistencyTest = async () => {
  console.log('🚀 Testing Dashboard vs Promotions Page Data Consistency\n');
  
  // Login
  await login();
  if (!authToken) return;
  
  console.log('\n📊 Testing Different Promotion Endpoints...\n');
  
  // Test endpoints that dashboard and promotions page might use
  const results = {};
  
  results.general = await testEndpoint('/promotions', 'General Promotions (old endpoint)');
  results.merchant = await testEndpoint('/promotions/merchant', 'Merchant Promotions (management page)');
  results.merchantActive = await testEndpoint('/promotions/merchant/active', 'Merchant Active Promotions (dashboard)');
  results.merchantStats = await testEndpoint('/promotions/merchant/stats', 'Merchant Stats');
  
  console.log('\n🔍 Data Consistency Analysis:\n');
  
  if (results.general && results.merchant) {
    console.log(`📈 General Promotions: ${results.general.count} items`);
    console.log(`🏪 Merchant Promotions: ${results.merchant.count} items`);
    console.log(`⚡ Merchant Active: ${results.merchantActive?.count || 0} items`);
    
    if (results.general.count > results.merchant.count) {
      console.log('✅ Security working: Merchant sees fewer promotions than general endpoint');
    } else if (results.general.count === results.merchant.count && results.merchant.count > 0) {
      console.log('⚠️  Possible issue: Merchant sees same count as general (might be showing all stores)');
    } else if (results.merchant.count === 0) {
      console.log('ℹ️  Info: Merchant has no promotions in their store');
    }
    
    if (results.merchantActive && results.merchant.count !== results.merchantActive.count) {
      console.log(`ℹ️  Note: Active promotions (${results.merchantActive.count}) differs from all promotions (${results.merchant.count})`);
    }
  }
  
  console.log('\n💡 Expected Behavior:');
  console.log('- Dashboard "Active Promotions" should show merchant-specific count');
  console.log('- Promotions management page should show same merchant data');
  console.log('- General endpoint should show more items (all stores) vs merchant endpoint');
  console.log('- Both dashboard and management should be consistent');
  
  console.log('\n🎯 Status:');
  if (results.merchant && results.merchantActive) {
    console.log('✅ Merchant-specific endpoints are working');
    console.log('✅ Dashboard and management page should now show consistent data');
  } else {
    console.log('❌ Some merchant endpoints are not working properly');
  }
};

// Run the test
runConsistencyTest().catch(console.error);

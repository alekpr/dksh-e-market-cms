/**
 * ✅ Verify Promotion Assignment Results
 * Check if promotions were successfully assigned to merchant
 */

import axios from 'axios';

const API_BASE_URL = 'http://54.251.126.43:3000/api/v1';

const merchantAccount = {
  email: 'merchant@dksh.com',
  password: 'merchant123'
};

let authToken = null;

const login = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, merchantAccount);
    
    if (response.data.success) {
      authToken = response.data.data.token;
      console.log('✅ Login successful');
      return response.data.data.user;
    }
  } catch (error) {
    console.log('❌ Login failed:', error.response?.data?.message || error.message);
    return null;
  }
};

const testEndpoint = async (endpoint, description) => {
  try {
    const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (response.data.success) {
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
      
      console.log(`✅ ${description}: ${count} items`);
      
      if (items.length > 0) {
        console.log(`   📝 Sample promotions:`);
        items.slice(0, 3).forEach((item, index) => {
          console.log(`      ${index + 1}. ${item.title} (${item.type}) - ${item.status}`);
        });
      }
      
      return { count, items };
    }
  } catch (error) {
    console.log(`❌ ${description} failed:`, error.response?.data?.message || error.message);
    return null;
  }
};

const verifyAssignment = async () => {
  console.log('🔍 Verifying Promotion Assignment Results\n');
  
  // Login
  const user = await login();
  if (!user) return;
  
  console.log(`👤 Logged in as: ${user.name} (${user.email})`);
  console.log(`🏪 Store: ${user.merchantInfo?.storeName} (${user.merchantInfo?.storeId})\n`);
  
  console.log('📊 Testing Different Endpoints...\n');
  
  // Test various endpoints
  const results = {};
  
  results.general = await testEndpoint('/promotions?limit=100', 'General Promotions (all stores)');
  results.merchant = await testEndpoint('/promotions/merchant?limit=100', 'Merchant Promotions (filtered)');
  results.merchantActive = await testEndpoint('/promotions/merchant/active', 'Merchant Active Promotions');
  results.merchantStats = await testEndpoint('/promotions/merchant/stats', 'Merchant Statistics');
  
  console.log('\n🎯 Verification Results:\n');
  
  if (results.general && results.merchant) {
    const generalCount = results.general.count;
    const merchantCount = results.merchant.count;
    
    console.log(`📈 General endpoint: ${generalCount} promotions`);
    console.log(`🏪 Merchant endpoint: ${merchantCount} promotions`);
    
    if (generalCount === merchantCount && merchantCount > 0) {
      console.log('✅ SUCCESS: All promotions now belong to this merchant!');
      console.log('✅ Dashboard and management page should show consistent data');
    } else if (merchantCount > 0 && generalCount > merchantCount) {
      console.log('⚠️  PARTIAL: Some promotions belong to merchant, but others exist for different stores');
    } else if (merchantCount === 0) {
      console.log('❌ ISSUE: Merchant still has no promotions assigned');
    }
    
    if (results.merchantActive) {
      console.log(`⚡ Active promotions: ${results.merchantActive.count}`);
    }
  }
  
  console.log('\n💡 Expected after successful assignment:');
  console.log('- Merchant endpoints should show promotions (not 0)');
  console.log('- Dashboard "Active Promotions" should show > 0');
  console.log('- Promotions management page should list promotions');
  console.log('- Both dashboard and management should be consistent');
  
  return results;
};

// Run verification
verifyAssignment().catch(console.error);

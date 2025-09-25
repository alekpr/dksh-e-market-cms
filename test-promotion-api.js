/**
 * 🧪 Test CMS Promotion API Integration
 * Test script to verify merchant-specific promotion filtering
 */

const axios = require('axios');

const API_BASE_URL = 'http://54.251.126.43:3000/api/v1';

// Test merchant accounts
const merchants = {
  merchant1: {
    email: 'merchant1@example.com', 
    password: 'password123',
    storeId: '123'
  },
  merchant2: {
    email: 'merchant2@example.com',
    password: 'password123', 
    storeId: '456'
  }
};

let tokens = {};

const login = async (merchantKey) => {
  try {
    const merchant = merchants[merchantKey];
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: merchant.email,
      password: merchant.password
    });
    
    if (response.data.success) {
      tokens[merchantKey] = response.data.data.token;
      console.log(`✅ ${merchantKey} logged in successfully`);
      return tokens[merchantKey];
    }
  } catch (error) {
    console.log(`❌ ${merchantKey} login failed:`, error.response?.data?.message || error.message);
    return null;
  }
};

const testPromotionApi = async (merchantKey, endpoint, description) => {
  try {
    const token = tokens[merchantKey];
    if (!token) {
      console.log(`❌ No token for ${merchantKey}`);
      return;
    }

    const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.data.success) {
      const promotions = response.data.data.promotions || response.data.data.flashSales || response.data.data.banners || response.data.data.products || [];
      console.log(`✅ ${merchantKey} - ${description}:`);
      console.log(`   📊 Found ${promotions.length} items`);
      
      // Check if all promotions belong to the merchant's store
      const merchantStoreId = merchants[merchantKey].storeId;
      const foreignPromotions = promotions.filter(item => 
        item.storeId && item.storeId.toString() !== merchantStoreId
      );
      
      if (foreignPromotions.length > 0) {
        console.log(`❌ SECURITY ISSUE: Found ${foreignPromotions.length} items from other stores!`);
        foreignPromotions.forEach(item => {
          console.log(`   🚨 Item ID: ${item._id}, Store: ${item.storeId} (should be ${merchantStoreId})`);
        });
      } else {
        console.log(`   ✅ All items belong to store ${merchantStoreId}`);
      }
    }
  } catch (error) {
    console.log(`❌ ${merchantKey} - ${description} failed:`, error.response?.data?.message || error.message);
  }
};

const runTests = async () => {
  console.log('🚀 Starting CMS Promotion API Security Tests\n');
  
  // Login merchants
  await login('merchant1');
  await login('merchant2');
  
  console.log('\n📝 Testing Promotion Endpoints...\n');
  
  // Test various promotion endpoints for both merchants
  const endpoints = [
    { path: '/promotions/merchant', desc: 'Get All Promotions' },
    { path: '/promotions/merchant/active', desc: 'Get Active Promotions' },
    { path: '/promotions/merchant/featured-products', desc: 'Get Featured Products' },
    { path: '/promotions/merchant/flash-sales', desc: 'Get Flash Sales' },
    { path: '/promotions/merchant/banners', desc: 'Get Promotional Banners' },
    { path: '/promotions/merchant/stats', desc: 'Get Promotion Stats' }
  ];
  
  for (const endpoint of endpoints) {
    console.log(`\n--- Testing: ${endpoint.desc} ---`);
    await testPromotionApi('merchant1', endpoint.path, endpoint.desc);
    await testPromotionApi('merchant2', endpoint.path, endpoint.desc);
  }
  
  console.log('\n🎯 Test Results Summary:');
  console.log('✅ If all tests show "All items belong to store X" = Security working correctly');
  console.log('❌ If any test shows "SECURITY ISSUE" = Merchants can see other stores data');
  console.log('\n💡 Expected: Each merchant should only see their own store promotions');
};

// Run the tests
runTests().catch(console.error);

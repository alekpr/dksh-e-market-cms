#!/usr/bin/env node

/**
 * Test CMS API Connection to Production Server
 * Run with: node test-cms-api-connection.js
 */

const API_BASE_URL = 'http://54.251.126.43:3000/api/v1';

console.log('🔍 Testing CMS API Connection...');
console.log(`📡 Production Server: ${API_BASE_URL}`);
console.log('');

async function testAPIConnection() {
  try {
    // Test basic API health
    console.log('1. Testing API Health...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    
    if (healthResponse.ok) {
      console.log('✅ API Health Check: OK');
    } else {
      console.log(`❌ API Health Check: Failed (${healthResponse.status})`);
    }

    // Test categories endpoint (public)
    console.log('2. Testing Categories Endpoint...');
    const categoriesResponse = await fetch(`${API_BASE_URL}/categories/public`);
    
    if (categoriesResponse.ok) {
      const categoriesData = await categoriesResponse.json();
      console.log('✅ Categories Endpoint: OK');
      console.log(`📊 Categories Count: ${categoriesData.count || 'N/A'}`);
    } else {
      console.log(`❌ Categories Endpoint: Failed (${categoriesResponse.status})`);
    }

    // Test stores endpoint (public)
    console.log('3. Testing Stores Endpoint...');
    const storesResponse = await fetch(`${API_BASE_URL}/stores?limit=1`);
    
    if (storesResponse.ok) {
      const storesData = await storesResponse.json();
      console.log('✅ Stores Endpoint: OK');
      console.log(`🏪 Stores Count: ${storesData.count || storesData.data?.length || 'N/A'}`);
    } else {
      console.log(`❌ Stores Endpoint: Failed (${storesResponse.status})`);
    }

    // Test promotions endpoint
    console.log('4. Testing Promotions Endpoint...');
    const promotionsResponse = await fetch(`${API_BASE_URL}/promotions?limit=1`);
    
    if (promotionsResponse.ok) {
      const promotionsData = await promotionsResponse.json();
      console.log('✅ Promotions Endpoint: OK');
      console.log(`🎯 Promotions Count: ${promotionsData.results || 'N/A'}`);
    } else {
      console.log(`❌ Promotions Endpoint: Failed (${promotionsResponse.status})`);
    }

  } catch (error) {
    console.log('❌ Connection Error:', error.message);
  }

  console.log('');
  console.log('🎯 Test Complete!');
  console.log('');
  console.log('📋 Next Steps:');
  console.log('1. If all tests pass: CMS is ready to use production server');
  console.log('2. If tests fail: Check if production server is running');
  console.log('3. Start CMS development server: npm run dev');
  console.log('4. Login to CMS and verify all features work');
}

testAPIConnection();
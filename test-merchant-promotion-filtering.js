/**
 * Test script to check merchant promotion filtering
 * This script tests if the promotion list shows only merchant's own promotions
 */
const axios = require('axios');

const BASE_URL = 'http://54.251.126.43:3000/api/v1';

// Test configuration - Replace with actual values
const TEST_MERCHANT_TOKEN = 'YOUR_MERCHANT_TOKEN_HERE';
const TEST_MERCHANT_STORE_ID = 'YOUR_STORE_ID_HERE';

async function testMerchantPromotionFiltering() {
  try {
    console.log('🎯 Testing Merchant Promotion Filtering...\n');

    // Test 1: Get all promotions via merchant endpoint
    console.log('=== Test 1: GET /promotions/merchant ===');
    const merchantResponse = await axios.get(`${BASE_URL}/promotions/merchant`, {
      headers: {
        'Authorization': `Bearer ${TEST_MERCHANT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Merchant endpoint response:');
    console.log('Status:', merchantResponse.status);
    console.log('Total promotions:', merchantResponse.data.results);
    
    if (merchantResponse.data.data?.promotions) {
      const promotions = merchantResponse.data.data.promotions;
      console.log('Promotions found:', promotions.length);
      
      // Check if all promotions belong to the merchant's store
      const wrongStorePromotions = promotions.filter(promo => 
        promo.storeId && promo.storeId !== TEST_MERCHANT_STORE_ID
      );
      
      if (wrongStorePromotions.length > 0) {
        console.log('❌ PROBLEM FOUND: Some promotions belong to other stores!');
        console.log('Wrong store promotions:');
        wrongStorePromotions.forEach(promo => {
          console.log(`- "${promo.title}" belongs to store: ${promo.storeId} (should be: ${TEST_MERCHANT_STORE_ID})`);
        });
      } else {
        console.log('✅ All promotions belong to the correct store');
      }
      
      // Show sample promotions
      console.log('\nSample promotions:');
      promotions.slice(0, 3).forEach((promo, index) => {
        console.log(`${index + 1}. "${promo.title}" - Store: ${promo.storeId || 'N/A'} - Status: ${promo.status}`);
      });
    }

    // Test 2: Test with explicit storeId parameter
    console.log('\n=== Test 2: GET /promotions/merchant?storeId=EXPLICIT ===');
    const explicitResponse = await axios.get(`${BASE_URL}/promotions/merchant?storeId=${TEST_MERCHANT_STORE_ID}`, {
      headers: {
        'Authorization': `Bearer ${TEST_MERCHANT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Explicit storeId response:');
    console.log('Total promotions:', explicitResponse.data.results);

    // Test 3: Compare with admin endpoint (if accessible)
    console.log('\n=== Test 3: Compare with general endpoint (for comparison) ===');
    try {
      const generalResponse = await axios.get(`${BASE_URL}/promotions?storeId=${TEST_MERCHANT_STORE_ID}`, {
        headers: {
          'Authorization': `Bearer ${TEST_MERCHANT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ General endpoint response:');
      console.log('Total promotions:', generalResponse.data.results);
      
      // Compare results
      const merchantCount = merchantResponse.data.results || 0;
      const generalCount = generalResponse.data.results || 0;
      
      console.log(`\n📊 Comparison:`);
      console.log(`Merchant endpoint: ${merchantCount} promotions`);
      console.log(`General endpoint: ${generalCount} promotions`);
      
      if (merchantCount === generalCount) {
        console.log('✅ Both endpoints return the same count - filtering is working correctly');
      } else {
        console.log(`⚠️ Different counts - may indicate filtering issues`);
      }
      
    } catch (error) {
      console.log('⚠️ Could not access general endpoint (may require admin access)');
    }

    console.log('\n🎉 Merchant Promotion Filtering Test Completed!');

  } catch (error) {
    console.error('❌ Error testing merchant promotion filtering:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Hint: Please update TEST_MERCHANT_TOKEN with a valid merchant JWT token');
      console.log('💡 You can get a token by logging into CMS and checking the browser\'s localStorage');
    }
    
    if (error.response?.status === 403) {
      console.log('\n💡 Hint: Make sure the token belongs to a merchant user');
    }
  }
}

// Instructions for using this test
console.log('📋 Merchant Promotion Filtering Test');
console.log('=====================================');
console.log('This test checks if merchants see only their own promotions');
console.log('');
console.log('To run this test:');
console.log('1. Replace TEST_MERCHANT_TOKEN with a valid merchant JWT token');
console.log('2. Replace TEST_MERCHANT_STORE_ID with the merchant\'s store ID');
console.log('3. Run: node test-merchant-promotion-filtering.js');
console.log('');

// Run the test
testMerchantPromotionFiltering();
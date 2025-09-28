/**
 * Test script for Buy X Get Y promotion in CMS
 * Run this with: node test-buy-x-get-y-promotion.js
 */
const axios = require('axios');

const BASE_URL = 'http://54.251.126.43:3000/api/v1';

// Test data - replace with actual values
const TEST_MERCHANT_TOKEN = 'YOUR_MERCHANT_TOKEN_HERE';
const TEST_STORE_ID = 'YOUR_STORE_ID_HERE';
const TEST_PRODUCT_IDS = ['PRODUCT_ID_1', 'PRODUCT_ID_2']; // Replace with actual product IDs

async function testBuyXGetYPromotion() {
  try {
    console.log('🎯 Testing Buy X Get Y Promotion Creation...\n');

    // Create Buy X Get Y promotion
    const promotionData = {
      title: 'Buy 3 Get 1 Free - Rice Special',
      description: 'ซื้อข้าว 3 ถุง แถม 1 ถุงฟรี - โปรโมชั่นพิเศษ',
      type: 'buy_x_get_y',
      status: 'active',
      priority: 5,
      isActive: true,
      
      // Schedule (30 days promotion)
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      
      // Buy X Get Y configuration
      discount: {
        type: 'buy_x_get_y',
        buyQuantity: 3,
        getQuantity: 1,
        getDiscountType: 'free', // 100% free
        getDiscountValue: 0
      },
      
      // Product selection
      applicableItems: TEST_PRODUCT_IDS.map(productId => ({
        itemType: 'product',
        itemId: productId,
        includeVariants: true
      })),
      
      // Usage limits
      usageLimit: {
        total: 1000,
        perUser: 5,
        perDay: 50
      },
      
      // Targeting
      targeting: {
        stores: [TEST_STORE_ID],
        userRoles: ['customer'],
        newUsersOnly: false
      }
    };

    console.log('📤 Creating promotion with data:', JSON.stringify(promotionData, null, 2));

    const response = await axios.post(`${BASE_URL}/promotions/merchant`, promotionData, {
      headers: {
        'Authorization': `Bearer ${TEST_MERCHANT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Promotion created successfully!');
    console.log('📋 Response:', JSON.stringify(response.data, null, 2));
    
    const promotionId = response.data.data?.promotion?._id;
    if (promotionId) {
      console.log(`🆔 Promotion ID: ${promotionId}`);
      
      // Test retrieval
      console.log('\n🔍 Testing promotion retrieval...');
      const getResponse = await axios.get(`${BASE_URL}/promotions/merchant/${promotionId}`, {
        headers: {
          'Authorization': `Bearer ${TEST_MERCHANT_TOKEN}`
        }
      });
      
      console.log('✅ Promotion retrieved successfully!');
      console.log('📋 Retrieved data:', JSON.stringify(getResponse.data.data, null, 2));
    }

  } catch (error) {
    console.error('❌ Error testing Buy X Get Y promotion:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Hint: Please update TEST_MERCHANT_TOKEN with a valid merchant token');
    }
    
    if (error.response?.status === 400) {
      console.log('\n💡 Hint: Please check the promotion data format and required fields');
      console.log('Error details:', error.response.data);
    }
  }
}

// Run the test
testBuyXGetYPromotion();

/**
 * Expected behavior:
 * 1. Creates a Buy X Get Y promotion successfully
 * 2. Returns promotion ID
 * 3. Can retrieve the created promotion
 * 4. Shows proper Buy X Get Y configuration in response
 * 
 * To use this test:
 * 1. Replace TEST_MERCHANT_TOKEN with actual merchant JWT token
 * 2. Replace TEST_STORE_ID with actual store ID
 * 3. Replace TEST_PRODUCT_IDS with actual product IDs
 * 4. Run: node test-buy-x-get-y-promotion.js
 */
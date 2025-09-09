/**
 * 🔧 Assign All Existing Promotions to Merchant
 * Script to update all promotions in production to belong to merchant@dksh.com
 */

import axios from 'axios';

const API_BASE_URL = 'http://54.251.126.43:3000/api/v1';

// Target merchant account
const merchantAccount = {
  email: 'merchant@dksh.com',
  password: 'merchant123'
};

let authToken = null;
let merchantStoreId = null;

const login = async () => {
  try {
    console.log('🔐 Logging in as merchant...');
    const response = await axios.post(`${API_BASE_URL}/auth/login`, merchantAccount);
    
    console.log('Login response status:', response.status);
    console.log('Login response data:', response.data);
    
    // Handle different response structures
    const isSuccess = response.data.success || response.data.status === 'success';
    const token = response.data.token || response.data.data?.token;
    const user = response.data.data?.user || response.data.user;
    
    if (isSuccess && token && user) {
      authToken = token;
      merchantStoreId = user.merchantInfo?.storeId;
      
      console.log('✅ Login successful');
      console.log(`🏪 Store ID: ${merchantStoreId}`);
      console.log(`👤 User: ${user.name} (${user.email})`);
      
      return true;
    } else {
      console.log('❌ Login failed: Missing required data');
      console.log('Token:', !!token);
      console.log('User:', !!user);
      console.log('Success:', isSuccess);
      return false;
    }
  } catch (error) {
    console.log('❌ Login failed:', error.response?.data?.message || error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
    return false;
  }
};

const getAllPromotions = async () => {
  try {
    console.log('\n📊 Fetching all promotions...');
    
    // Get all promotions using admin/general endpoint
    const response = await axios.get(`${API_BASE_URL}/promotions?limit=100`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('Promotions response status:', response.status);
    console.log('Promotions response data structure:', {
      success: response.data.success,
      status: response.data.status,
      results: response.data.results,
      hasData: !!response.data.data,
      hasPromotions: !!response.data.data?.promotions,
      promotionsLength: response.data.data?.promotions?.length
    });
    
    // Handle different response structures
    const isSuccess = response.data.success || response.data.status === 'success';
    
    if (isSuccess) {
      const promotions = response.data.data?.promotions || [];
      console.log(`✅ Found ${promotions.length} promotions`);
      
      if (promotions.length > 0) {
        // Show current store assignments
        const storeAssignments = {};
        promotions.forEach(promo => {
          const storeId = promo.storeId?.toString() || 'No Store';
          storeAssignments[storeId] = (storeAssignments[storeId] || 0) + 1;
        });
        
        console.log('\n📈 Current store assignments:');
        Object.entries(storeAssignments).forEach(([storeId, count]) => {
          console.log(`   ${storeId}: ${count} promotions`);
        });
      }
      
      return promotions;
    } else {
      console.log('❌ API response indicates failure');
      return [];
    }
  } catch (error) {
    console.log('❌ Failed to fetch promotions:', error.response?.data?.message || error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
    return [];
  }
};

const updatePromotionStore = async (promotionId, title) => {
  try {
    console.log(`🔄 Updating: ${title || promotionId.slice(-8)}`);
    
    // Update promotion to assign to merchant's store
    const response = await axios.patch(`${API_BASE_URL}/promotions/${promotionId}`, {
      storeId: merchantStoreId
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`   Response status: ${response.status}`);
    console.log(`   Response data:`, response.data);
    
    // Handle different response structures
    const isSuccess = response.data.success || response.data.status === 'success';
    
    if (isSuccess) {
      console.log(`✅ Updated: ${title || promotionId.slice(-8)}`);
      return true;
    } else {
      console.log(`❌ Update failed for ${title || promotionId.slice(-8)}: API response indicates failure`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Failed to update ${title || promotionId.slice(-8)}:`, error.response?.data?.message || error.message);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Data:`, error.response.data);
    }
    return false;
  }
};

const runAssignment = async () => {
  console.log('🚀 Starting Promotion Assignment to Merchant\n');
  
  // Step 1: Login
  const loginSuccess = await login();
  if (!loginSuccess || !merchantStoreId) {
    console.log('❌ Cannot proceed without successful login and store ID');
    return;
  }
  
  // Step 2: Get all promotions
  const promotions = await getAllPromotions();
  if (promotions.length === 0) {
    console.log('ℹ️ No promotions found to update');
    return;
  }
  
  // Step 3: Filter promotions that don't belong to merchant yet
  const promotionsToUpdate = promotions.filter(promo => 
    promo.storeId?.toString() !== merchantStoreId.toString()
  );
  
  console.log(`\n🎯 Promotions to update: ${promotionsToUpdate.length}/${promotions.length}`);
  
  if (promotionsToUpdate.length === 0) {
    console.log('✅ All promotions already belong to this merchant!');
    return;
  }
  
  // Step 4: Show what will be updated
  console.log('\n📝 Promotions that will be assigned to merchant:');
  promotionsToUpdate.forEach((promo, index) => {
    console.log(`   ${index + 1}. ${promo.title} (${promo._id.slice(-8)}) - Current store: ${promo.storeId || 'None'}`);
  });
  
  // Step 5: Ask for confirmation (in real script, you might want to add readline)
  console.log(`\n⚠️ This will assign ${promotionsToUpdate.length} promotions to store ${merchantStoreId}`);
  console.log('⚠️ This action cannot be easily undone!');
  
  // For automated execution, we'll proceed. In interactive mode, you'd ask for confirmation.
  console.log('\n🔧 Proceeding with assignment...\n');
  
  // Step 6: Update each promotion
  let successCount = 0;
  let failCount = 0;
  
  for (const promotion of promotionsToUpdate) {
    const success = await updatePromotionStore(promotion._id, promotion.title);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Step 7: Summary
  console.log(`\n📊 Assignment Summary:`);
  console.log(`✅ Successfully updated: ${successCount} promotions`);
  console.log(`❌ Failed to update: ${failCount} promotions`);
  console.log(`🎯 Total processed: ${promotionsToUpdate.length} promotions`);
  
  if (successCount > 0) {
    console.log('\n🎉 Promotions have been assigned to the merchant!');
    console.log('💡 Now the merchant should see these promotions in their CMS');
  }
};

// Usage instructions
console.log('🔧 PROMOTION ASSIGNMENT TOOL');
console.log('=============================');
console.log('This script will assign ALL existing promotions to merchant@dksh.com');
console.log('Make sure you have the correct merchant credentials and store ID');
console.log('');

// Run the assignment
runAssignment().catch(console.error);

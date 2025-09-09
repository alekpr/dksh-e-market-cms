import axios from 'axios';

async function checkPromotionDetails() {
    try {
        console.log('🔍 Checking Promotion Details on Production Server\n');
        
        // Login
        console.log('1️⃣ Logging in...');
        const loginResponse = await axios.post('http://54.251.126.43:3000/api/v1/auth/login', {
            email: 'merchant@dksh.com',
            password: 'merchant123'
        });
        
        const token = loginResponse.data.token;
        const merchantStoreId = loginResponse.data.data.user.merchantInfo.storeId;
        console.log(`✅ Login successful`);
        console.log(`🏪 Merchant Store ID: ${merchantStoreId}\n`);
        
        // Headers with auth
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        
        // Get all promotions via general endpoint to see raw data
        console.log('2️⃣ Getting all promotions (raw data)...');
        const allPromotions = await axios.get('http://54.251.126.43:3000/api/v1/promotions', {
            headers
        });
        
        console.log('Raw response structure:', JSON.stringify(allPromotions.data, null, 2));
        
        const promotions = allPromotions.data.data.promotions || allPromotions.data.data || [];
        console.log(`Found ${promotions.length} total promotions:`);
        
        if (Array.isArray(promotions)) {
            promotions.forEach((promo, index) => {
                console.log(`📦 Promotion ${index + 1}:`);
                console.log(`   Title: ${promo.title}`);
                console.log(`   Store ID: ${promo.storeId || 'NO STORE ID'}`);
                console.log(`   Type: ${promo.type || 'unknown'}`);
                console.log(`   Status: ${promo.status || 'unknown'}`);
                console.log(`   Created: ${promo.createdAt || 'unknown'}`);
                console.log(`   Matches Merchant: ${promo.storeId === merchantStoreId ? '✅ YES' : '❌ NO'}\n`);
            });
        } else {
            console.log('❌ Promotions data is not an array:', typeof promotions);
        }
        
        // Try merchant endpoint to see what it returns
        console.log('3️⃣ Testing merchant endpoint...');
        try {
            const merchantPromotions = await axios.get('http://54.251.126.43:3000/api/v1/promotions/merchant', {
                headers
            });
            console.log(`Merchant endpoint returned ${merchantPromotions.data.data?.promotions?.length || merchantPromotions.data.data?.length || 0} promotions`);
            const merchantPromos = merchantPromotions.data.data?.promotions || merchantPromotions.data.data || [];
            if (merchantPromos.length > 0) {
                merchantPromos.forEach((promo, index) => {
                    console.log(`🎯 Merchant Promotion ${index + 1}: ${promo.title} (${promo.storeId})`);
                });
            }
        } catch (error) {
            console.log(`❌ Merchant endpoint error: ${error.response?.data?.message || error.message}`);
        }
        
        console.log('\n🔍 Analysis:');
        console.log('- If promotions have storeId matching merchant but merchant endpoint returns 0 = filtering bug');
        console.log('- If promotions have no storeId = assignment script needs to run again');
        console.log('- If promotions have different storeId = wrong assignment');
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

checkPromotionDetails();

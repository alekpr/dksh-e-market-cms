import axios from 'axios';

async function testDashboardPromotions() {
    try {
        console.log('🔍 Testing Dashboard Promotion Loading\n');
        
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
        
        // Test different promotion endpoints that dashboard might use
        console.log('2️⃣ Testing promotion endpoints for dashboard...\n');
        
        // Test 1: Regular merchant promotions (what dashboard currently uses)
        console.log('🔍 Test 1: Regular merchant promotions');
        try {
            const regularPromos = await axios.get('http://54.251.126.43:3000/api/v1/promotions/merchant?limit=100', {
                headers
            });
            console.log(`   ✅ Found ${regularPromos.data.data.promotions.length} regular promotions`);
        } catch (error) {
            console.log(`   ❌ Error: ${error.response?.data?.message || error.message}`);
        }
        
        // Test 2: Active merchant promotions (what dashboard should use)
        console.log('🔍 Test 2: Active merchant promotions');
        try {
            const activePromos = await axios.get('http://54.251.126.43:3000/api/v1/promotions/merchant?limit=100&active=true', {
                headers
            });
            console.log(`   ✅ Found ${activePromos.data.data.promotions.length} active promotions`);
            activePromos.data.data.promotions.forEach((promo, index) => {
                console.log(`   📦 Active Promotion ${index + 1}: ${promo.title} (Status: ${promo.status}, Currently Active: ${promo.isCurrentlyActive})`);
            });
        } catch (error) {
            console.log(`   ❌ Error: ${error.response?.data?.message || error.message}`);
        }
        
        // Test 3: Merchant active endpoint
        console.log('🔍 Test 3: Merchant active endpoint');
        try {
            const merchantActivePromos = await axios.get('http://54.251.126.43:3000/api/v1/promotions/merchant/active', {
                headers
            });
            console.log(`   ✅ Found ${merchantActivePromos.data.length} merchant active promotions`);
            if (Array.isArray(merchantActivePromos.data)) {
                merchantActivePromos.data.forEach((promo, index) => {
                    console.log(`   🎯 Merchant Active ${index + 1}: ${promo.title} (Currently Active: ${promo.isCurrentlyActive})`);
                });
            }
        } catch (error) {
            console.log(`   ❌ Error: ${error.response?.data?.message || error.message}`);
        }
        
        console.log('\n🔍 Analysis:');
        console.log('- Dashboard should use "active=true" parameter or "/merchant/active" endpoint');
        console.log('- If regular endpoint shows promotions but active endpoint shows 0, check date ranges');
        console.log('- If isCurrentlyActive is false, promotion is not within its date range');
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testDashboardPromotions();

import axios from 'axios';

async function testVerbose() {
    try {
        console.log('🔍 Verbose Debug Test\n');
        
        // Login
        const loginResponse = await axios.post('http://54.251.126.43:3000/api/v1/auth/login', {
            email: 'merchant@dksh.com',
            password: 'merchant123'
        });
        
        const token = loginResponse.data.token;
        console.log(`✅ Login successful\n`);
        
        // Headers
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        
        // Test debug endpoint with verbose output
        console.log('🔍 Getting verbose debug data...');
        const debugResponse = await axios.get('http://54.251.126.43:3000/api/v1/promotions/merchant/test-active-filter', { headers });
        
        console.log('✅ Debug Response:');
        console.log('Current Time:', debugResponse.data.debug.currentTime);
        console.log('Store ID:', debugResponse.data.debug.storeId);
        console.log('Total Promotions:', debugResponse.data.debug.totalPromotions);
        console.log('Active Promotions:', debugResponse.data.debug.activePromotions);
        
        console.log('\n📦 All Promotions:');
        debugResponse.data.data.allPromotions.forEach((promo, index) => {
            console.log(`   ${index + 1}. ${promo.title}`);
            console.log(`      Status: ${promo.status}`);
            console.log(`      IsActive: ${promo.isActive}`);
            console.log(`      Start: ${promo.startDate}`);
            console.log(`      End: ${promo.endDate}`);
            console.log(`      Store: ${promo.storeId}`);
        });
        
        console.log('\n🎯 Active Promotions (manual query):');
        debugResponse.data.data.activePromotions.forEach((promo, index) => {
            console.log(`   ${index + 1}. ${promo.title}`);
            console.log(`      Status: ${promo.status}`);
            console.log(`      IsActive: ${promo.isActive}`);
            console.log(`      Start: ${promo.startDate}`);
            console.log(`      End: ${promo.endDate}`);
            console.log(`      Store: ${promo.storeId}`);
        });
        
        // Compare with getAllPromotions
        console.log('\n🔍 Comparing with getAllPromotions endpoint...');
        try {
            const getAllResponse = await axios.get('http://54.251.126.43:3000/api/v1/promotions/merchant?active=true', { headers });
            console.log(`getAllPromotions with active=true: ${getAllResponse.data.data.promotions.length} results`);
            
            if (getAllResponse.data.data.promotions.length === 0) {
                console.log('❌ getAllPromotions returns 0 but manual query returns 2');
                console.log('💡 This confirms there is a bug in getAllPromotions controller logic!');
            }
        } catch (error) {
            console.log('Error calling getAllPromotions:', error.message);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testVerbose();

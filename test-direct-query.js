import axios from 'axios';

async function testDirectQuery() {
    try {
        console.log('🔍 Testing Direct MongoDB Query Logic\n');
        
        // Login
        const loginResponse = await axios.post('http://54.251.126.43:3000/api/v1/auth/login', {
            email: 'merchant@dksh.com',
            password: 'merchant123'
        });
        
        const token = loginResponse.data.token;
        const merchantStoreId = loginResponse.data.data.user.merchantInfo.storeId;
        console.log(`✅ Login successful - Store: ${merchantStoreId}\n`);
        
        // Headers
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        
        // Get all promotions first
        console.log('1️⃣ Getting all merchant promotions...');
        const allPromos = await axios.get('http://54.251.126.43:3000/api/v1/promotions/merchant', { headers });
        console.log(`Found ${allPromos.data.data.promotions.length} total promotions\n`);
        
        // Test different active parameter variations
        const testVariations = [
            'active=true',
            'active=True', 
            'active=TRUE',
            'status=active',
            'status=active&isActive=true'
        ];
        
        for (const variation of testVariations) {
            console.log(`🔍 Testing: ${variation}`);
            try {
                const url = `http://54.251.126.43:3000/api/v1/promotions/merchant?${variation}`;
                const response = await axios.get(url, { headers });
                console.log(`   Results: ${response.data.data.promotions.length} promotions`);
            } catch (error) {
                console.log(`   Error: ${error.response?.status} ${error.message}`);
            }
        }
        
        console.log('\n2️⃣ Manual filter test - checking promotion fields...');
        
        const promotions = allPromos.data.data.promotions;
        const now = new Date();
        
        console.log(`Current time: ${now.toISOString()}\n`);
        
        promotions.forEach((promo, index) => {
            const startDate = new Date(promo.startDate);
            const endDate = new Date(promo.endDate);
            const isInDateRange = startDate <= now && endDate >= now;
            
            console.log(`📦 Promotion ${index + 1}: ${promo.title}`);
            console.log(`   Status: "${promo.status}" (type: ${typeof promo.status})`);
            console.log(`   IsActive: ${promo.isActive} (type: ${typeof promo.isActive})`);
            console.log(`   StoreId: ${promo.storeId || 'undefined'}`);
            console.log(`   Start: ${startDate.toISOString()}`);
            console.log(`   End: ${endDate.toISOString()}`);
            console.log(`   Start <= now: ${startDate <= now}`);
            console.log(`   End >= now: ${endDate >= now}`);
            console.log(`   In range: ${isInDateRange}`);
            
            // Manual active check
            const manualActiveCheck = 
                promo.status === 'active' &&
                promo.isActive === true &&
                startDate <= now &&
                endDate >= now;
                
            console.log(`   Manual active check: ${manualActiveCheck ? '✅ PASS' : '❌ FAIL'}`);
            console.log();
        });
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testDirectQuery();

import axios from 'axios';

async function debugActiveQuery() {
    try {
        console.log('🔍 Debug Active Query\n');
        
        // Login
        const loginResponse = await axios.post('http://54.251.126.43:3000/api/v1/auth/login', {
            email: 'merchant@dksh.com',
            password: 'merchant123'
        });
        
        const token = loginResponse.data.token;
        const merchantStoreId = loginResponse.data.data.user.merchantInfo.storeId;
        console.log(`✅ Login successful - Store: ${merchantStoreId}\n`);
        
        // Headers with auth
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        
        // Test exact query that should work
        console.log('🔍 Testing exact active query...');
        const activeQuery = `http://54.251.126.43:3000/api/v1/promotions/merchant?active=true&limit=100`;
        console.log(`URL: ${activeQuery}`);
        
        try {
            const response = await axios.get(activeQuery, { headers });
            console.log('✅ Response received');
            console.log('Response data structure:', {
                status: response.data.status,
                results: response.data.results,
                pagination: response.data.pagination,
                promotionsLength: response.data.data?.promotions?.length
            });
            
            if (response.data.data?.promotions?.length > 0) {
                console.log('\n📦 Promotions found:');
                response.data.data.promotions.forEach((promo, index) => {
                    console.log(`   ${index + 1}. ${promo.title} (${promo.status}, active: ${promo.isCurrentlyActive})`);
                });
            } else {
                console.log('\n❌ No promotions found in response');
            }
        } catch (error) {
            console.log(`❌ Error: ${error.response?.status} ${error.response?.statusText}`);
            console.log('Error data:', error.response?.data);
        }
        
        // Test without active filter to compare
        console.log('\n🔍 Testing without active filter for comparison...');
        try {
            const allResponse = await axios.get('http://54.251.126.43:3000/api/v1/promotions/merchant?limit=100', { headers });
            console.log(`✅ Without active filter: ${allResponse.data.data?.promotions?.length} promotions`);
            
            if (allResponse.data.data?.promotions?.length > 0) {
                console.log('Promotion details:');
                allResponse.data.data.promotions.forEach((promo, index) => {
                    const startDate = new Date(promo.startDate);
                    const endDate = new Date(promo.endDate);
                    const now = new Date();
                    const inRange = startDate <= now && endDate >= now;
                    
                    console.log(`   ${index + 1}. ${promo.title}`);
                    console.log(`      Status: ${promo.status}, IsActive: ${promo.isActive}`);
                    console.log(`      Date range valid: ${inRange}`);
                    console.log(`      Currently active: ${promo.isCurrentlyActive}`);
                });
            }
        } catch (error) {
            console.log(`❌ Error without filter: ${error.message}`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

debugActiveQuery();

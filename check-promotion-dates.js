import axios from 'axios';

async function checkPromotionDates() {
    try {
        console.log('🔍 Checking Promotion Date Ranges\n');
        
        // Login
        console.log('1️⃣ Logging in...');
        const loginResponse = await axios.post('http://54.251.126.43:3000/api/v1/auth/login', {
            email: 'merchant@dksh.com',
            password: 'merchant123'
        });
        
        const token = loginResponse.data.token;
        console.log(`✅ Login successful\n`);
        
        // Headers with auth
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        
        // Get all merchant promotions to check dates
        console.log('2️⃣ Getting merchant promotions...');
        const promotions = await axios.get('http://54.251.126.43:3000/api/v1/promotions/merchant', {
            headers
        });
        
        const now = new Date();
        console.log(`📅 Current time: ${now.toISOString()}\n`);
        
        console.log(`Found ${promotions.data.data.promotions.length} promotions:\n`);
        
        promotions.data.data.promotions.forEach((promo, index) => {
            const startDate = new Date(promo.startDate);
            const endDate = new Date(promo.endDate);
            const isInDateRange = startDate <= now && endDate >= now;
            const isCurrentlyActive = promo.isCurrentlyActive;
            
            console.log(`📦 Promotion ${index + 1}: ${promo.title}`);
            console.log(`   Status: ${promo.status}`);
            console.log(`   IsActive: ${promo.isActive}`);
            console.log(`   Start: ${startDate.toISOString()}`);
            console.log(`   End: ${endDate.toISOString()}`);
            console.log(`   In date range: ${isInDateRange ? '✅ YES' : '❌ NO'}`);
            console.log(`   Currently active: ${isCurrentlyActive ? '✅ YES' : '❌ NO'}`);
            
            if (!isInDateRange) {
                if (startDate > now) {
                    console.log(`   ⏰ Starts in: ${Math.round((startDate.getTime() - now.getTime()) / (1000 * 60 * 60))} hours`);
                } else if (endDate < now) {
                    console.log(`   ⏰ Ended: ${Math.round((now.getTime() - endDate.getTime()) / (1000 * 60 * 60))} hours ago`);
                }
            }
            console.log();
        });
        
        console.log('🔍 Analysis:');
        console.log('- For promotion to be "active", it needs:');
        console.log('  1. status === "active"');
        console.log('  2. isActive === true');
        console.log('  3. startDate <= now <= endDate');
        console.log('- Check if promotion dates are in future or past');
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

checkPromotionDates();

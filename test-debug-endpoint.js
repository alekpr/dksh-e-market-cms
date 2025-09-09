import axios from 'axios';

async function testDebugEndpoint() {
    try {
        console.log('🔍 Testing Debug Endpoint\n');
        
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
        
        // Test debug endpoint
        console.log('🔍 Calling debug endpoint...');
        const debugResponse = await axios.get('http://54.251.126.43:3000/api/v1/promotions/merchant/test-active-filter', { headers });
        
        console.log('Response received:', debugResponse.data);
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testDebugEndpoint();

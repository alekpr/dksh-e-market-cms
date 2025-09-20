import axios from 'axios';

// Test authorization in CMS context
async function testCMSAuthorization() {
  console.log('🧪 Testing CMS Authorization Context');
  
  // Simulate CMS stored token (what we find in localStorage)
  // You'll need to get this from the CMS browser console
  const cmsToken = "YOUR_CMS_TOKEN_HERE"; // Replace with actual token from CMS
  
  if (cmsToken === "YOUR_CMS_TOKEN_HERE") {
    console.log('❗ Please replace YOUR_CMS_TOKEN_HERE with actual token from CMS');
    showTokenExtractionInstructions();
    return;
  }
  
  try {
    const response = await axios.get('http://localhost:3000/api/v1/orders/674be43779e37e85ed59cc46', {
      headers: {
        'Authorization': `Bearer ${cmsToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ CMS Token Authorization Test SUCCESS');
    console.log('Response data:', response.data);
    
  } catch (error) {
    console.error('❌ CMS Token Authorization Test FAILED');
    console.error('Error status:', error.response?.status);
    console.error('Error data:', error.response?.data);
    
    if (error.response?.status === 401) {
      console.error('🔐 Token validation issue - checking token format...');
      console.error('Token length:', cmsToken?.length);
      console.error('Token starts with:', cmsToken?.substring(0, 20));
    }
  }
}

// Helper function to show how to extract token from CMS
function showTokenExtractionInstructions() {
  console.log(`
📋 To test CMS authorization:

1. Open your CMS in browser
2. Open Developer Console (F12)
3. Run this command:
   localStorage.getItem('access_token')

4. Copy the token value and replace YOUR_CMS_TOKEN_HERE above
5. Then run this script

Example:
   node test-cms-authorization.js
  `);
}

if (process.argv.includes('--help')) {
  showTokenExtractionInstructions();
} else {
  testCMSAuthorization();
}
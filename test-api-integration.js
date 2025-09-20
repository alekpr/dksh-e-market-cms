/**
 * API Integration Test Script
 * Quick test to verify backend API endpoints are working
 */

const API_BASE_URL = 'http://localhost:3000/api/v1';

// Mock authentication token (replace with real token)
const AUTH_TOKEN = 'your-auth-token-here';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${AUTH_TOKEN}`
};

async function testEndpoint(endpoint, method = 'GET', data = null) {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`Testing: ${method} ${url}`);
  
  const config = {
    method,
    headers: method !== 'GET' && data ? headers : { 'Authorization': headers.Authorization }
  };
  
  if (method !== 'GET' && data) {
    config.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(url, config);
    
    // Get raw text first
    const rawText = await response.text();
    let result;
    
    try {
      result = JSON.parse(rawText);
    } catch (parseError) {
      console.log(`⚠️  ${method} ${endpoint}: Non-JSON response`, {
        status: response.status,
        raw: rawText.substring(0, 200) + (rawText.length > 200 ? '...' : '')
      });
      return { success: false, status: response.status, error: 'Non-JSON response', raw: rawText };
    }
    
    console.log(`✅ ${method} ${endpoint}:`, {
      status: response.status,
      ok: response.ok,
      data: result
    });
    
    return { success: true, status: response.status, data: result };
  } catch (error) {
    console.log(`❌ ${method} ${endpoint}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function runApiTests() {
  console.log('🚀 Starting API Integration Tests...\n');
  
  // Test public endpoints (no auth required)
  console.log('📋 Testing Public Endpoints:');
  await testEndpoint('/store-layout-templates');
  await testEndpoint('/store-layout-templates/popular');
  await testEndpoint('/store-layout-templates/category/retail');
  await testEndpoint('/store-layout-templates/search?q=template');
  
  console.log('\n🔐 Testing Admin Endpoints:');
  // These will fail without proper auth token
  await testEndpoint('/store-layout-templates/admin/pending');
  await testEndpoint('/store-layout-templates/admin/analytics');
  
  console.log('\n📁 Testing Media Endpoints:');
  await testEndpoint('/template-media');
  
  console.log('\n✨ API Integration Tests Complete!');
}

// Test template creation data
const sampleTemplate = {
  name: 'Test Template',
  description: 'API integration test template',
  category: 'retail',
  difficulty: 'beginner',
  tags: ['test', 'api'],
  features: ['responsive', 'customizable'],
  layout: {
    sections: [
      {
        id: 'hero-1',
        type: 'hero',
        name: 'Hero Section',
        config: {
          title: 'Welcome to Our Store',
          subtitle: 'Discover amazing products'
        },
        styles: {
          backgroundColor: '#ffffff',
          padding: '60px 0'
        },
        visible: true,
        order: 1
      }
    ],
    globalStyles: {
      colors: {
        primary: '#007bff',
        secondary: '#6c757d',
        accent: '#28a745',
        background: '#ffffff',
        text: '#333333'
      },
      typography: {
        fontFamily: 'Arial, sans-serif',
        fontSize: {
          base: '16px',
          h1: '2.5rem',
          h2: '2rem',
          h3: '1.5rem'
        }
      },
      spacing: {
        container: '1200px',
        section: '40px',
        element: '20px'
      },
      borderRadius: {
        small: '4px',
        medium: '8px',
        large: '12px'
      }
    },
    responsive: {
      breakpoints: {
        mobile: '768px',
        tablet: '1024px',
        desktop: '1200px'
      },
      hiddenOnMobile: [],
      hiddenOnTablet: [],
      hiddenOnDesktop: []
    }
  }
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testApi = runApiTests;
  window.testEndpoint = testEndpoint;
  window.sampleTemplate = sampleTemplate;
  console.log('API test functions available:');
  console.log('- window.testApi() - Run all API tests');
  console.log('- window.testEndpoint(endpoint, method, data) - Test single endpoint');
  console.log('- window.sampleTemplate - Sample template data');
}

// Run tests if in Node.js environment
if (typeof window === 'undefined') {
  runApiTests();
}

// ES module export
export {
  testEndpoint,
  runApiTests,
  sampleTemplate
};
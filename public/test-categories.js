// Test script for categories page
console.log('🧪 Testing Categories Page...')

// Test 1: Check if categories page loads
try {
  if (window.location.pathname === '/categories') {
    console.log('✅ Categories page route is active')
  }
} catch (error) {
  console.error('❌ Route test failed:', error)
}

// Test 2: Check for Select component errors
const originalError = console.error
let selectErrors = []
console.error = function(...args) {
  const message = args.join(' ')
  if (message.includes('Select.Item') && message.includes('empty string')) {
    selectErrors.push(message)
  }
  originalError.apply(console, args)
}

// Test 3: Check if category management components exist
setTimeout(() => {
  console.log('🔍 Checking for Select component errors...')
  if (selectErrors.length === 0) {
    console.log('✅ No Select component errors found')
  } else {
    console.log('❌ Select component errors:', selectErrors)
  }
  
  // Test 4: Check if sidebar has categories menu
  const sidebar = document.querySelector('[data-sidebar="menu"]')
  if (sidebar) {
    const categoryLink = Array.from(sidebar.querySelectorAll('a')).find(a => 
      a.getAttribute('href') === '/categories' || a.textContent.includes('Category')
    )
    if (categoryLink) {
      console.log('✅ Categories menu item found in sidebar')
    } else {
      console.log('❌ Categories menu item not found in sidebar')
    }
  }
  
  console.log('🎉 Test completed!')
}, 2000)

// Add to window for manual testing
window.testCategories = function() {
  window.location.href = '/categories'
}

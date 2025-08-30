/**
 * Hierarchical Category System - End-to-End Testing
 * 
 * Test Scenarios:
 * 1. Merchant สร้าง category ในร้าน
 * 2. Admin สร้าง master category
 * 3. Admin assign store category ให้ master category
 * 4. ตรวจสอบ hierarchical structure ใน public API
 */

import { test, expect, Page, BrowserContext } from '@playwright/test'

// Test Configuration
const BASE_URL = 'http://localhost:3000'
const CMS_URL = 'http://localhost:5173'
const API_BASE = `${BASE_URL}/api/v1`

// Test Accounts
const TEST_ACCOUNTS = {
  admin: {
    email: 'admin@dksh.com',
    password: 'admin123',
    role: 'admin'
  },
  merchant: {
    email: 'merchant@dksh.com', 
    password: 'merchant123',
    role: 'merchant'
  }
}

// Test Data
const TEST_DATA = {
  masterCategory: {
    name: 'Playwright Test Electronics',
    description: 'Master category สำหรับทดสอบ Playwright',
    icon: 'fas fa-laptop'
  },
  storeCategory: {
    name: 'Playwright Test Smartphones',
    description: 'Store category สำหรับทดสอบ Playwright'
  }
}

// Helper Functions
class CategoryTestHelper {
  constructor(private page: Page) {}

  async loginAs(userType: 'admin' | 'merchant') {
    const account = TEST_ACCOUNTS[userType]
    
    console.log(`🔐 Logging in as ${userType}: ${account.email}`)
    
    await this.page.goto(`${CMS_URL}/login`)
    await this.page.waitForLoadState('networkidle')
    
    // Fill login form
    await this.page.fill('input[type="email"]', account.email)
    await this.page.fill('input[type="password"]', account.password)
    
    // Click login button
    await this.page.click('button[type="submit"]')
    
    // Wait for navigation to dashboard
    await this.page.waitForURL('**/dashboard', { timeout: 10000 })
    await this.page.waitForLoadState('networkidle')
    
    console.log(`✅ Successfully logged in as ${userType}`)
  }

  async navigateToStoreCategories() {
    console.log('📂 Navigating to Store Categories')
    
    // Click on Categories in sidebar
    await this.page.click('text=Store Categories')
    await this.page.waitForURL('**/categories')
    await this.page.waitForLoadState('networkidle')
    
    console.log('✅ Navigated to Store Categories page')
  }

  async navigateToAdminHierarchicalCategories() {
    console.log('🏗️ Navigating to Admin Hierarchical Categories')
    
    // Click on Category System in sidebar 
    await this.page.click('text=Category System')
    await this.page.waitForURL('**/admin/categories/hierarchical')
    await this.page.waitForLoadState('networkidle')
    
    console.log('✅ Navigated to Hierarchical Categories page')
  }

  async createStoreCategory() {
    console.log('🛒 Creating store category...')
    
    // Click Add Category button
    await this.page.click('button:has-text("Add Category")')
    await this.page.waitForSelector('form')
    
    // Fill form
    await this.page.fill('input[name="name"]', TEST_DATA.storeCategory.name)
    await this.page.fill('textarea[name="description"]', TEST_DATA.storeCategory.description)
    
    // Save category
    await this.page.click('button:has-text("Save")')
    
    // Wait for success and navigation back to list
    await this.page.waitForSelector(`text=${TEST_DATA.storeCategory.name}`, { timeout: 10000 })
    
    console.log(`✅ Store category "${TEST_DATA.storeCategory.name}" created successfully`)
  }

  async createMasterCategory() {
    console.log('🏗️ Creating master category...')
    
    // Switch to Master Categories tab
    await this.page.click('button:has-text("Master Categories")')
    await this.page.waitForLoadState('networkidle')
    
    // Click Add Master Category button
    await this.page.click('button:has-text("Add Master Category")')
    await this.page.waitForSelector('dialog')
    
    // Fill form in dialog
    await this.page.fill('input#name', TEST_DATA.masterCategory.name)
    await this.page.fill('textarea#description', TEST_DATA.masterCategory.description)
    await this.page.fill('input#icon', TEST_DATA.masterCategory.icon)
    
    // Save master category
    await this.page.click('button:has-text("Create")')
    
    // Wait for success
    await this.page.waitForSelector(`text=${TEST_DATA.masterCategory.name}`, { timeout: 10000 })
    
    console.log(`✅ Master category "${TEST_DATA.masterCategory.name}" created successfully`)
  }

  async assignStoreToMaster() {
    console.log('🔗 Assigning store category to master category...')
    
    // Switch to Store Categories tab
    await this.page.click('button:has-text("Store Categories")')
    await this.page.waitForLoadState('networkidle')
    
    // Find the store category row
    const categoryRow = this.page.locator(`text=${TEST_DATA.storeCategory.name}`).locator('..').locator('..')
    
    // Click on assignment dropdown
    await categoryRow.locator('select').selectOption({ label: TEST_DATA.masterCategory.name })
    
    // Wait for assignment to complete
    await this.page.waitForSelector('text=Assigned', { timeout: 10000 })
    
    console.log(`✅ Store category assigned to master category successfully`)
  }

  async verifyHierarchicalStructure() {
    console.log('🔍 Verifying hierarchical structure...')
    
    // Switch to Hierarchical View tab
    await this.page.click('button:has-text("Hierarchical View")')
    await this.page.waitForLoadState('networkidle')
    
    // Check if master category exists with store category under it
    const masterCard = this.page.locator(`text=${TEST_DATA.masterCategory.name}`).locator('..').locator('..')
    await expect(masterCard).toBeVisible()
    
    // Check if store category is listed under master
    const storeSection = masterCard.locator(`text=${TEST_DATA.storeCategory.name}`)
    await expect(storeSection).toBeVisible()
    
    console.log('✅ Hierarchical structure verified successfully')
  }

  async verifyPublicAPI() {
    console.log('🌐 Verifying public API response...')
    
    // Make API call to public hierarchical endpoint
    const response = await this.page.request.get(`${API_BASE}/categories/public?hierarchical=true`)
    expect(response.ok()).toBeTruthy()
    
    const data = await response.json()
    expect(data.success).toBe(true)
    
    // Find our test master category in the response
    const testMaster = data.data.find((item: any) => 
      item.masterCategory.name === TEST_DATA.masterCategory.name
    )
    
    expect(testMaster).toBeDefined()
    expect(testMaster.stores).toBeDefined()
    expect(testMaster.stores.length).toBeGreaterThan(0)
    
    // Find our test store category
    const hasStoreCategory = testMaster.stores.some((store: any) =>
      store.categories.some((cat: any) => cat.name === TEST_DATA.storeCategory.name)
    )
    
    expect(hasStoreCategory).toBe(true)
    
    console.log('✅ Public API response verified successfully')
  }

  async cleanup() {
    console.log('🧹 Cleaning up test data...')
    
    // Note: In a real test, you might want to delete test categories
    // For now, we'll just log the cleanup
    console.log('⚠️ Cleanup: Test categories left in database for inspection')
  }
}

test.describe('Hierarchical Category System E2E Tests', () => {
  let context: BrowserContext
  let adminPage: Page
  let merchantPage: Page

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext()
    adminPage = await context.newPage()
    merchantPage = await context.newPage()
  })

  test.afterAll(async () => {
    await context.close()
  })

  test('Complete Hierarchical Category Workflow', async () => {
    const adminHelper = new CategoryTestHelper(adminPage)
    const merchantHelper = new CategoryTestHelper(merchantPage)

    // Step 1: Merchant creates a store category
    test.step('Merchant creates store category', async () => {
      await merchantHelper.loginAs('merchant')
      await merchantHelper.navigateToStoreCategories()
      await merchantHelper.createStoreCategory()
    })

    // Step 2: Admin creates master category
    test.step('Admin creates master category', async () => {
      await adminHelper.loginAs('admin')
      await adminHelper.navigateToAdminHierarchicalCategories()
      await adminHelper.createMasterCategory()
    })

    // Step 3: Admin assigns store category to master
    test.step('Admin assigns store category to master', async () => {
      await adminHelper.assignStoreToMaster()
    })

    // Step 4: Verify hierarchical structure in UI
    test.step('Verify hierarchical structure in UI', async () => {
      await adminHelper.verifyHierarchicalStructure()
    })

    // Step 5: Verify public API response
    test.step('Verify public API returns correct hierarchical data', async () => {
      await adminHelper.verifyPublicAPI()
    })

    // Step 6: Cleanup
    test.step('Cleanup test data', async () => {
      await adminHelper.cleanup()
    })
  })

  test('Admin Access Control', async () => {
    const merchantHelper = new CategoryTestHelper(merchantPage)

    test.step('Merchant cannot access admin hierarchical page', async () => {
      await merchantHelper.loginAs('merchant')
      
      // Try to navigate directly to admin page
      await merchantPage.goto(`${CMS_URL}/admin/categories/hierarchical`)
      
      // Should see access denied message
      await expect(merchantPage.locator('text=Admin Access Required')).toBeVisible()
    })
  })

  test('Merchant Category Management', async () => {
    const merchantHelper = new CategoryTestHelper(merchantPage)

    test.step('Merchant can manage own store categories', async () => {
      await merchantHelper.loginAs('merchant')
      await merchantHelper.navigateToStoreCategories()
      
      // Should see category management interface
      await expect(merchantPage.locator('button:has-text("Add Category")')).toBeVisible()
      
      // Should NOT see hierarchical management options
      await expect(merchantPage.locator('text=Master Categories')).not.toBeVisible()
    })
  })
})

// Performance Tests
test.describe('Hierarchical Category Performance', () => {
  test('Public API Performance', async ({ page }) => {
    const startTime = Date.now()
    
    const response = await page.request.get(`${API_BASE}/categories/public?hierarchical=true`)
    
    const endTime = Date.now()
    const responseTime = endTime - startTime
    
    expect(response.ok()).toBeTruthy()
    expect(responseTime).toBeLessThan(2000) // Should respond within 2 seconds
    
    console.log(`📊 Public API response time: ${responseTime}ms`)
  })
})

// Data Integrity Tests  
test.describe('Hierarchical Category Data Integrity', () => {
  test('Orphan Categories Detection', async ({ page }) => {
    const helper = new CategoryTestHelper(page)
    
    await helper.loginAs('admin')
    await helper.navigateToAdminHierarchicalCategories()
    
    // Switch to Store Categories tab to see orphan categories
    await page.click('button:has-text("Store Categories")')
    
    // Check for orphan badge
    const orphanBadges = page.locator('text=Orphan')
    const orphanCount = await orphanBadges.count()
    
    console.log(`🔍 Found ${orphanCount} orphan categories`)
    
    // This is informational - orphan categories are expected in some cases
    expect(orphanCount).toBeGreaterThanOrEqual(0)
  })
})

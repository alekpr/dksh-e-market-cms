// This is a simple Playwright script to test the store deletion functionality
// Run with: npx playwright test test-store-delete.js

const { test, expect } = require('@playwright/test');

test('Test store deletion functionality', async ({ page }) => {
  // Navigate to your local development server
  await page.goto('http://localhost:3000/stores');
  
  // Wait for the page to load
  await page.waitForSelector('text=Store Management');
  
  // Click on the Actions menu for the first store in the list
  const moreButtons = await page.$$('button[aria-haspopup="menu"]');
  if (moreButtons.length > 0) {
    await moreButtons[0].click();
    
    // Wait for the dropdown menu to appear
    await page.waitForSelector('text=Delete Store');
    
    // Click the Delete Store option
    await page.click('text=Delete Store');
    
    // Wait for any alert dialogs and accept them
    page.on('dialog', async dialog => {
      console.log(`Dialog message: ${dialog.message()}`);
      await dialog.accept();
    });
    
    // Wait for a moment to see the result
    await page.waitForTimeout(3000);
    
    // Check if the toast message appears
    const pageContent = await page.content();
    console.log('Page content after delete:', pageContent);
    
    // You may want to validate that the store is actually removed from the list
    // This depends on your specific implementation
  } else {
    console.log('No stores found to delete');
  }
});

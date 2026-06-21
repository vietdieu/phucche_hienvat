// Playwright Cross-Browser Testing Script for CulturalVault
// Run with: npx playwright test scripts/test-cross-browser.js

const { test, expect } = require('@playwright/test');

test.describe('CulturalVault Cross-Browser Heritage Portal Tests', () => {
  const targetUrl = process.env.TEST_URL || 'http://localhost:3000';

  test('1. Verify application landing page structure and localization', async ({ page }) => {
    // Navigate to local dev host or shared deployment
    await page.goto(targetUrl);
    
    // Check main title
    await expect(page).toHaveTitle(/CulturalVault/i);
    
    // Assert visual branding elements exist
    const headerTitle = page.locator('h1');
    await expect(headerTitle).toContainText(/PHOTO & VIDEO ANIMATION/i);
  });

  test('2. Verify theme customizer options and local state persistence', async ({ page }) => {
    await page.goto(targetUrl);
    
    // Open Personalization settings popup
    const settingsToggle = page.locator('#theme-settings-toggle');
    await expect(settingsToggle).toBeVisible();
    await settingsToggle.click();
    
    // Check theme modal dialog popped up
    const dialogHeader = page.locator('h3:has-text("Tùy Chọn Cá Nhân Hóa Giao Diện")');
    await expect(dialogHeader).toBeVisible();
    
    // Choose emerald (Ngọc lục bảo) color scheme
    const emeraldBtn = page.locator('button:has-text("Ngọc lục bảo")');
    await expect(emeraldBtn).toBeVisible();
    await emeraldBtn.click();
    
    // Check if configuration attribute persists on html document root element
    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveAttribute('data-color-scheme', 'emerald');
    
    // Choose compact spacing density
    const compactBtn = page.locator('button:has-text("Gọn gàng")');
    await expect(compactBtn).toBeVisible();
    await compactBtn.click();
    await expect(htmlElement).toHaveAttribute('data-density', 'compact');
    
    // Reload page to test localStorage cache persistence
    await page.reload();
    await expect(htmlElement).toHaveAttribute('data-color-scheme', 'emerald');
    await expect(htmlElement).toHaveAttribute('data-density', 'compact');
  });

  test('3. Verify interactive vinyl record sound trigger', async ({ page }) => {
    await page.goto(targetUrl);
    
    // Toggle vinyl player
    const vinylBtn = page.locator('#vinyl-toggle');
    await expect(vinylBtn).toBeVisible();
    await expect(vinylBtn).toContainText(/đang tắt/i);
    
    // Click button to play audio
    await vinylBtn.click();
    await expect(vinylBtn).toContainText(/đang bật/i);
  });

  test('4. Verify collection page elements loading', async ({ page }) => {
    await page.goto(targetUrl);
    
    // Click "Bộ Sưu Tập" tab button to navigate
    const navCollection = page.locator('button:has-text("Bộ Sưu Tập")');
    await expect(navCollection).toBeVisible();
    await navCollection.click();
    
    // Verify catalog header is visible
    const collectionHeader = page.locator('h2:has-text("Sưu Tập Di Sản")');
    await expect(collectionHeader).toBeVisible();
  });
});

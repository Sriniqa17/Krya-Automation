// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://uat-trustzen.kryacheck.com';

test.describe('Krya VTS - Landing Page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
  });

  // ─── Page Load & Title ──────────────────────────────────────────────────────

  test('TC01 - Page loads successfully', async ({ page }) => {
    await expect(page).toHaveURL(BASE_URL + '/');
    await expect(page).toHaveTitle(/Krya|Verification Tracking/i);
  });

  // ─── Header / Navbar ────────────────────────────────────────────────────────

  test('TC02 - Krya logo is visible', async ({ page }) => {
    const logo = page.locator('img[alt*="krya" i], .logo, header img').first();
    await expect(logo).toBeVisible();
  });

  test('TC03 - Help button is visible and clickable', async ({ page }) => {
    const helpBtn = page.getByRole('link', { name: /help/i })
      .or(page.getByText('Help').first());
    await expect(helpBtn).toBeVisible();
    await helpBtn.click();
    // Adjust assertion based on actual behaviour (modal / redirect)
    // await expect(page).toHaveURL(/help/i);
  });

  test('TC04 - Get Started button is visible', async ({ page }) => {
    const getStarted = page.getByRole('button', { name: /get started/i })
      .or(page.getByRole('link', { name: /get started/i }));
    await expect(getStarted).toBeVisible();
  });

  test('TC05 - Get Started button navigates on click', async ({ page }) => {
    const getStarted = page.getByRole('button', { name: /get started/i })
      .or(page.getByRole('link', { name: /get started/i }));
    await getStarted.click();
    await page.waitForLoadState('networkidle');
    // Update the expected URL pattern based on actual redirect
    await expect(page).not.toHaveURL(BASE_URL + '/');
  });

  // ─── Hero Section ───────────────────────────────────────────────────────────

  test('TC06 - Hero heading "Verification Tracking System" is visible', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /verification tracking system/i })
    ).toBeVisible();
  });

  test('TC07 - Welcome To text is visible', async ({ page }) => {
    await expect(page.getByText('Welcome To')).toBeVisible();
  });

  test('TC08 - Hero sub-text is visible', async ({ page }) => {
    await expect(
      page.getByText(/helping organizations across the globe/i)
    ).toBeVisible();
  });

  test('TC09 - Hero illustration image is visible', async ({ page }) => {
    // Adjust selector if the image has a specific class/alt
    const heroImage = page.locator('.hero img, section img, .banner img').first();
    await expect(heroImage).toBeVisible();
  });

  // ─── Login Cards ────────────────────────────────────────────────────────────

  test('TC10 - Krya Login (Internal) card is visible', async ({ page }) => {
    await expect(page.getByText('Krya Login')).toBeVisible();
    await expect(page.getByText('Internal')).toBeVisible();
  });

  test('TC11 - Client Login (Business Partner) card is visible', async ({ page }) => {
    await expect(page.getByText('Client Login')).toBeVisible();
    await expect(page.getByText('Business Partner')).toBeVisible();
  });

  test('TC12 - Candidate Login (External) card is visible', async ({ page }) => {
    await expect(page.getByText('Candidate Login')).toBeVisible();
    await expect(page.getByText('External')).toBeVisible();
  });

  test('TC13 - Clicking Krya Login navigates to internal login page', async ({ page }) => {
    await page.getByText('Krya Login').click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/login|internal|krya/i);
  });

  test('TC14 - Clicking Client Login navigates to client login page', async ({ page }) => {
    await page.getByText('Client Login').click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/login|client|partner/i);
  });

  test('TC15 - Clicking Candidate Login navigates to candidate login page', async ({ page }) => {
    await page.getByText('Candidate Login').click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/login|candidate|external/i);
  });

  // ─── Footer ─────────────────────────────────────────────────────────────────

  test('TC16 - Footer copyright text is visible', async ({ page }) => {
    await expect(
      page.getByText(/Verification Tracking System.*Krya Screening/i)
    ).toBeVisible();
  });

  test('TC17 - Privacy Policies link is visible and clickable', async ({ page }) => {
    const privacyLink = page.getByRole('link', { name: /privacy policies/i });
    await expect(privacyLink).toBeVisible();
    await privacyLink.click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/privacy/i);
  });

  // ─── Responsive / Visual ────────────────────────────────────────────────────

  test('TC18 - Page screenshot (baseline)', async ({ page }) => {
    await expect(page).toHaveScreenshot('landing-page.png', {
      fullPage: true,
      threshold: 0.2,
    });
  });

  test('TC19 - Page is responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(BASE_URL);
    await expect(
      page.getByRole('heading', { name: /verification tracking system/i })
    ).toBeVisible();
  });

});
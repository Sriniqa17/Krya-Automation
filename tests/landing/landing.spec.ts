import { test, expect } from '../../fixtures/baseTest';

test.describe('Krya VTS - Landing Page', () => {

  test.beforeEach(async ({ landingPage }) => {
    await landingPage.goto();
  });

  // ── Page Load ────────────────────────────────────────────────────────────────

  test('TC01 - Page loads successfully and URL is correct', async ({ page }) => {
    await expect(page).toHaveURL(/uat-trustzen\.kryacheck\.com/);
    await expect(page).toHaveTitle(/Krya|Verification Tracking/i);
  });

  // ── Header / Navbar ──────────────────────────────────────────────────────────

  test('TC02 - Krya logo is visible in header', async ({ landingPage }) => {
    await expect(landingPage.logo).toBeVisible();
  });

  test('TC03 - Help button is visible', async ({ landingPage }) => {
    await expect(landingPage.helpButton).toBeVisible();
  });

  test('TC04 - Get Started button is visible', async ({ landingPage }) => {
    await expect(landingPage.getStartedButton).toBeVisible();
  });

  test('TC05 - Get Started button navigates away from landing', async ({ landingPage, page }) => {
    await landingPage.clickGetStarted();
    await expect(page).not.toHaveURL(/^https:\/\/uat-trustzen\.kryacheck\.com\/?$/);
  });

  // ── Hero Section ─────────────────────────────────────────────────────────────

  test('TC06 - Hero heading "Verification Tracking System" is visible', async ({ landingPage }) => {
    await expect(landingPage.heroHeading).toBeVisible();
  });

  test('TC07 - "Welcome To" text is visible', async ({ landingPage }) => {
    await expect(landingPage.welcomeText).toBeVisible();
  });

  test('TC08 - Hero sub-text is visible', async ({ landingPage }) => {
    await expect(landingPage.heroSubText).toBeVisible();
  });

  // ── Login Cards ───────────────────────────────────────────────────────────────

  test('TC09 - Krya Login (Internal) card is visible', async ({ landingPage }) => {
    await expect(landingPage.kryaLoginCard).toBeVisible();
    await expect(landingPage.kryaLoginLabel).toBeVisible();
  });

  test('TC10 - Client Login (Business Partner) card is visible', async ({ landingPage }) => {
    await expect(landingPage.clientLoginCard).toBeVisible();
    await expect(landingPage.clientLoginLabel).toBeVisible();
  });

  test('TC11 - Candidate Login (External) card is visible', async ({ landingPage }) => {
    await expect(landingPage.candidateLoginCard).toBeVisible();
    await expect(landingPage.candidateLoginLabel).toBeVisible();
  });

  test('TC12 - Clicking Krya Login navigates to internal login page', async ({ landingPage, page }) => {
    await landingPage.clickKryaLogin();
    await expect(page).toHaveURL(/login|internal|krya/i);
  });

  test('TC13 - Clicking Client Login navigates to client login page', async ({ landingPage, page }) => {
    await landingPage.clickClientLogin();
    await expect(page).toHaveURL(/login|client|partner/i);
  });

  test('TC14 - Clicking Candidate Login navigates to candidate login page', async ({ landingPage, page }) => {
    await landingPage.clickCandidateLogin();
    await expect(page).toHaveURL(/login|candidate|external/i);
  });

  // ── Footer ───────────────────────────────────────────────────────────────────

  test('TC15 - Footer copyright text is visible', async ({ landingPage }) => {
    await expect(landingPage.footerCopyright).toBeVisible();
  });

  test('TC16 - Privacy Policies link is visible and navigates', async ({ landingPage, page }) => {
    await expect(landingPage.privacyPoliciesLink).toBeVisible();
    await landingPage.clickPrivacyPolicies();
    await expect(page).toHaveURL(/privacy/i);
  });

  // ── Responsive ───────────────────────────────────────────────────────────────

  test('TC17 - Page is responsive on mobile viewport (375x812)', async ({ landingPage }) => {
    await landingPage.page.setViewportSize({ width: 375, height: 812 });
    await landingPage.goto();
    await expect(landingPage.heroHeading).toBeVisible();
    await expect(landingPage.kryaLoginCard).toBeVisible();
  });

  test('TC18 - Page is responsive on tablet viewport (768x1024)', async ({ landingPage }) => {
    await landingPage.page.setViewportSize({ width: 768, height: 1024 });
    await landingPage.goto();
    await expect(landingPage.heroHeading).toBeVisible();
  });
});

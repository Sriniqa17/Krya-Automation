import { test, expect } from '../../fixtures/baseTest';
import authData from '../../data/authData.json';

test.describe('Krya VTS - Dashboard', () => {

  test.beforeEach(async ({ landingPage, loginPage }) => {
    await landingPage.goto();
    await landingPage.clickKryaLogin();
    await loginPage.login(authData.kryaUser.email, authData.kryaUser.password);
  });

  // ── Page Load ─────────────────────────────────────────────────────────────────

  test('TC01 - Dashboard loads after successful login', async ({ dashboardPage }) => {
    await dashboardPage.verifyDashboardLoaded();
  });

  test('TC02 - Dashboard URL does not contain login path', async ({ page }) => {
    await expect(page).not.toHaveURL(/login/);
  });

  // ── Navigation ────────────────────────────────────────────────────────────────

  test('TC03 - Navbar is visible on dashboard', async ({ dashboardPage }) => {
    await expect(dashboardPage.navbar).toBeVisible();
  });

  test('TC04 - Page heading is present on dashboard', async ({ dashboardPage }) => {
    await expect(dashboardPage.pageHeading).toBeVisible();
  });

  // ── Logout from Dashboard ─────────────────────────────────────────────────────

  test('TC05 - Logout button is accessible from dashboard', async ({ dashboardPage }) => {
    await expect(dashboardPage.logoutButton.or(dashboardPage.userMenuButton)).toBeVisible();
  });
});

import { test, expect } from '../../fixtures/kryaTest';
import authData from '../../data/authData';

// Requires a saved Krya session: npm run auth:krya

test.describe('Krya VTS - Dashboard', () => {
  // UAT is slow to load the dashboard after choosing a department
  test.describe.configure({ timeout: 120_000 });

  test.beforeEach(async ({ departmentPage }) => {
    await departmentPage.goto();
    await departmentPage.chooseDepartment(authData.kryaLogin.department);
  });

  // ── Page Load ─────────────────────────────────────────────────────────────────

  test('TC01 - Dashboard loads after successful login', async ({ dashboardPage }) => {
    await dashboardPage.verifyDashboardLoaded();
  });

  test('TC02 - Dashboard URL does not contain login path', async ({ page }) => {
    await expect(page).toHaveURL(/dashboard\/home/);
    await expect(page).not.toHaveURL(/login/);
  });

  // ── Navigation ────────────────────────────────────────────────────────────────

  test('TC03 - Navbar is visible on dashboard', async ({ dashboardPage }) => {
    await expect(dashboardPage.navbar).toBeVisible();
  });

  test('TC04 - Page heading is present on dashboard', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Welcome to Verification Tracking System Dashboard!' })
    ).toBeVisible();
  });

  // ── Logout from Dashboard ─────────────────────────────────────────────────────

  test('TC05 - Logout button is accessible from dashboard', async ({ dashboardPage }) => {
    await expect(dashboardPage.logoutButton).toBeVisible();
    await expect(dashboardPage.userMenuButton).toBeVisible();
  });
});

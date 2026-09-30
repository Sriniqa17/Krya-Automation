import { test as baseTest } from '../../fixtures/baseTest';
import { test, expect } from '../../fixtures/kryaTest';
import authData from '../../data/authData';

/**
 * Visual regression: compares each page with a saved baseline screenshot.
 * - Create/refresh baselines:  npm run test:visual:update
 * - Compare against baselines: npm run test:visual
 * Baselines live next to this file in visual.spec.ts-snapshots/ (one set per OS).
 * Anything that changes between runs (captcha, counts, table data, dates) is masked.
 */

const VIEWPORT = { width: 1280, height: 800 };

baseTest.describe('Visual - Public pages', () => {
  baseTest.use({ viewport: VIEWPORT });
  baseTest.describe.configure({ timeout: 120_000 });

  baseTest('VR_001 - Krya login page', async ({ page, landingPage, kryaLoginPage }) => {
    await landingPage.goto();
    await landingPage.clickKryaLogin();
    await kryaLoginPage.verifyKryaLoginPageLoaded();
    await expect(page).toHaveScreenshot('krya-login.png', {
      mask: [kryaLoginPage.captchaContainer],
    });
  });
});

test.describe('Visual - Krya internal pages', () => {
  test.use({ viewport: VIEWPORT });
  // UAT is slow; each test walks department -> dashboard -> case creation
  test.describe.configure({ timeout: 120_000 });

  test.beforeEach(async ({ departmentPage }) => {
    await departmentPage.goto();
  });

  test('VR_002 - Choose Department page', async ({ page }) => {
    await expect(page).toHaveScreenshot('choose-department.png');
  });

  test('VR_003 - Dashboard', async ({ page, departmentPage }) => {
    await departmentPage.chooseDepartment(authData.kryaLogin.department);
    await expect(page.getByRole('heading', { name: 'Welcome to Verification Tracking System Dashboard!' })).toBeVisible();
    await expect(page).toHaveScreenshot('dashboard.png', {
      fullPage: true,
      // Tile counts change constantly — mask every tile that starts with a number
      mask: [page.locator('a').filter({ hasText: /^\s*\d+/ })],
    });
  });

  test('VR_004 - Case Creation list', async ({ page, departmentPage, caseCreationPage }) => {
    await departmentPage.chooseDepartment(authData.kryaLogin.department);
    await caseCreationPage.openFromDashboard();
    await expect(page.getByRole('cell').first()).toBeVisible();
    await expect(page).toHaveScreenshot('case-creation-list.png', {
      // Cells, record count and total page count all change as cases are added
      mask: [page.getByRole('cell'), page.getByText(/Showing \d+/), page.getByText(/^of \d+$/)],
    });
  });

  test('VR_005 - Case Creation Add form', async ({ page, departmentPage, caseCreationPage }) => {
    await departmentPage.chooseDepartment(authData.kryaLogin.department);
    await caseCreationPage.openFromDashboard();
    await caseCreationPage.clickAdd();
    await expect(page).toHaveScreenshot('case-creation-add-form.png', {
      mask: [caseCreationPage.receivedDateInput],
    });
  });
});

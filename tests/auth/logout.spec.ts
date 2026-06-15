import { test, expect } from '../../fixtures/baseTest';
import authData from '../../data/authData.json';

test.describe('Krya VTS - Logout', () => {

  test('TC01 - Krya Internal user can logout successfully', async ({
    landingPage,
    loginPage,
    dashboardPage,
    page,
  }) => {
    await landingPage.goto();
    await landingPage.clickKryaLogin();
    await loginPage.login(authData.kryaUser.email, authData.kryaUser.password);
    await dashboardPage.verifyDashboardLoaded();
    await dashboardPage.logout();
    await expect(page).toHaveURL(/login|\//);
  });

  test('TC02 - Client user can logout successfully', async ({
    landingPage,
    loginPage,
    dashboardPage,
    page,
  }) => {
    await landingPage.goto();
    await landingPage.clickClientLogin();
    await loginPage.login(authData.clientUser.email, authData.clientUser.password);
    await dashboardPage.verifyDashboardLoaded();
    await dashboardPage.logout();
    await expect(page).toHaveURL(/login|\//);
  });

  test('TC03 - Candidate user can logout successfully', async ({
    landingPage,
    loginPage,
    dashboardPage,
    page,
  }) => {
    await landingPage.goto();
    await landingPage.clickCandidateLogin();
    await loginPage.login(authData.candidateUser.email, authData.candidateUser.password);
    await dashboardPage.verifyDashboardLoaded();
    await dashboardPage.logout();
    await expect(page).toHaveURL(/login|\//);
  });

  test('TC04 - Session is not accessible after logout (back button)', async ({
    landingPage,
    loginPage,
    dashboardPage,
    page,
  }) => {
    await landingPage.goto();
    await landingPage.clickKryaLogin();
    await loginPage.login(authData.kryaUser.email, authData.kryaUser.password);
    const dashboardUrl = page.url();
    await dashboardPage.logout();
    await page.goBack();
    await expect(page).not.toHaveURL(dashboardUrl);
  });
});

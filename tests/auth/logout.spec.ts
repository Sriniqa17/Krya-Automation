import { test, expect } from '../../fixtures/baseTest';
import authData from '../../data/authData';

// These tests must log in themselves: logging out ends the server session, so they
// cannot reuse the saved Krya session without breaking every other test. All three
// logins now require a captcha, so they stay disabled until UAT offers a captcha bypass.
test.describe.fixme('Krya VTS - Logout', () => {

  test('TC01 - Krya Internal user can logout successfully', async ({
    landingPage,
    kryaLoginPage,
    dashboardPage,
    page,
  }) => {
    await landingPage.goto();
    await landingPage.clickKryaLogin();
    await kryaLoginPage.login(authData.kryaLogin.username, authData.kryaLogin.password);
    await dashboardPage.verifyDashboardLoaded();
    await dashboardPage.logout();
    await expect(page).toHaveURL(/login|\//);
  });

  test('TC02 - Client user can logout successfully', async ({
    landingPage,
    clientLoginPage,
    dashboardPage,
    page,
  }) => {
    await landingPage.goto();
    await landingPage.clickClientLogin();
    await clientLoginPage.login(authData.clientLogin.username, authData.clientLogin.password);
    await dashboardPage.verifyDashboardLoaded();
    await dashboardPage.logout();
    await expect(page).toHaveURL(/login|\//);
  });

  test('TC03 - Candidate user can logout successfully', async ({
    landingPage,
    candidateLoginPage,
    dashboardPage,
    page,
  }) => {
    await landingPage.goto();
    await landingPage.clickCandidateLogin();
    await candidateLoginPage.login(authData.candidateLogin.username, authData.candidateLogin.password);
    await dashboardPage.verifyDashboardLoaded();
    await dashboardPage.logout();
    await expect(page).toHaveURL(/login|\//);
  });

  test('TC04 - Session is not accessible after logout (back button)', async ({
    landingPage,
    kryaLoginPage,
    dashboardPage,
    page,
  }) => {
    await landingPage.goto();
    await landingPage.clickKryaLogin();
    await kryaLoginPage.login(authData.kryaLogin.username, authData.kryaLogin.password);
    const dashboardUrl = page.url();
    await dashboardPage.logout();
    await page.goBack();
    await expect(page).not.toHaveURL(dashboardUrl);
  });
});

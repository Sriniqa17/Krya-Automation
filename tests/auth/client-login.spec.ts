import { test, expect } from '../../fixtures/baseTest';
import authData from '../../data/authData';
import { LandingPage } from '../../pages/LandingPage';
import { ClientLoginPage } from '../../pages/ClientLoginPage';
import { DashboardPage } from '../../pages/DashboardPage';

/**
 * Client (Business Partner) login — positive and negative scenarios, based on observed UAT behaviour.
 *
 * - Fully automatic: the captcha answer is read from the GetCaptcha API (see BaseLoginPage).
 * - Tests run in order in one worker: the client account has a failed-attempt counter, so the
 *   single wrong-password test is followed by a successful login that resets it.
 * - A successful login ends any other open session of the same client user.
 */

const client = authData.clientLogin;
const neg = authData.negativeTestCases;
const unknownUser = () => `autotest_nouser_${Date.now()}`;

test.describe('Client Login', () => {
  test.describe.configure({ mode: 'default', timeout: 120_000 });
  test.use({ viewport: { width: 1280, height: 800 } });

  test.beforeEach(async ({ landingPage, clientLoginPage }) => {
    await landingPage.goto();
    await landingPage.clickClientLogin();
    await clientLoginPage.verifyClientLoginPageLoaded();
  });

  // ───────────────────────────────── Page & UI ─────────────────────────────────

  test.describe('Page and form behaviour', () => {
    test('CL_001 - Client login page shows all login elements', async ({ page, clientLoginPage }) => {
      await expect(page).toHaveURL(/\/login$/);
      await expect(clientLoginPage.clientLoginTab).toHaveText('CLIENT LOGIN');
      await expect(clientLoginPage.loginHeading).toBeVisible();
      await expect(clientLoginPage.usernameInput).toBeVisible();
      await expect(clientLoginPage.passwordInput).toBeVisible();
      await expect(clientLoginPage.captchaContainer).toBeVisible();
      await expect(clientLoginPage.captchaInput).toBeVisible();
      await expect(clientLoginPage.loginButton).toHaveText(/sign in/i);
      await expect(clientLoginPage.forgotPasswordLink).toBeVisible();
    });

    test('CL_002 - Sign In is disabled while username and password are empty', async ({ clientLoginPage }) => {
      await expect(clientLoginPage.loginButton).toBeDisabled();
    });

    test('CL_003 - Sign In is enabled only after both username and password are entered', async ({ clientLoginPage }) => {
      await clientLoginPage.usernameInput.fill(client.username);
      await expect(clientLoginPage.loginButton).toBeDisabled();
      await clientLoginPage.passwordInput.fill('any-password');
      await expect(clientLoginPage.loginButton).toBeEnabled();
    });

    test('CL_004 - Password is masked and the eye icon toggles visibility', async ({ clientLoginPage }) => {
      await clientLoginPage.passwordInput.fill('Secret@123');
      await expect(clientLoginPage.passwordInput).toHaveAttribute('type', 'password');
      await clientLoginPage.passwordVisibilityToggle.click();
      await expect(clientLoginPage.passwordInput).toHaveAttribute('type', 'text');
      await expect(clientLoginPage.passwordInput).toHaveValue('Secret@123');
      await clientLoginPage.passwordVisibilityToggle.click();
      await expect(clientLoginPage.passwordInput).toHaveAttribute('type', 'password');
    });

    test('CL_005 - Captcha refresh button loads a new captcha', async ({ clientLoginPage }) => {
      const before = await clientLoginPage.captchaContainer.getAttribute('src');
      await clientLoginPage.captchaRefreshButton.click();
      await expect(clientLoginPage.captchaContainer).not.toHaveAttribute('src', before ?? '');
    });

    test('CL_006 - Protected page redirects to login when not logged in', async ({ page }) => {
      await page.goto('/dashboard/home', { waitUntil: 'domcontentloaded' });
      await expect(page).toHaveURL(/\/login$/, { timeout: 30_000 });
    });
  });

  // ───────────────────────────── Negative scenarios ────────────────────────────

  test.describe('Negative scenarios', () => {
    test('CL_007 - Wrong captcha is rejected with "Captcha invalid"', async ({ page, clientLoginPage }) => {
      await clientLoginPage.usernameInput.fill(client.username);
      await clientLoginPage.passwordInput.fill(client.password);
      await clientLoginPage.captchaInput.fill('WRONG1');
      await clientLoginPage.loginButton.click();
      await expect(clientLoginPage.captchaInvalidError).toBeVisible();
      await expect(page).toHaveURL(/\/login$/);
    });

    test('CL_008 - Empty captcha is rejected with "Captcha invalid"', async ({ page, clientLoginPage }) => {
      await clientLoginPage.usernameInput.fill(client.username);
      await clientLoginPage.passwordInput.fill(client.password);
      await clientLoginPage.loginButton.click();
      await expect(clientLoginPage.captchaInvalidError).toBeVisible();
      await expect(page).toHaveURL(/\/login$/);
    });

    test('CL_009 - Unknown username is rejected with "Invalid Credentials"', async ({ page, clientLoginPage }) => {
      await clientLoginPage.loginWithCaptcha(unknownUser(), neg.invalidPassword);
      await expect(clientLoginPage.invalidCredentialsMessage).toBeVisible();
      await expect(page).toHaveURL(/\/login$/);
    });

    test('CL_010 - SQL injection in username is rejected', async ({ page, clientLoginPage }) => {
      await clientLoginPage.loginWithCaptcha(neg.sqlInjection, neg.sqlInjection);
      await expect(clientLoginPage.invalidCredentialsMessage).toBeVisible();
      await expect(page).toHaveURL(/\/login$/);
    });

    test('CL_011 - Script in username is rejected and not executed', async ({ page, clientLoginPage }) => {
      let alertShown = false;
      page.on('dialog', async (dialog) => {
        alertShown = true;
        await dialog.dismiss();
      });
      await clientLoginPage.loginWithCaptcha(neg.xssAttempt, neg.invalidPassword);
      await expect(clientLoginPage.invalidCredentialsMessage).toBeVisible();
      await expect(page).toHaveURL(/\/login$/);
      expect(alertShown, 'injected script must not run').toBe(false);
    });

    test('CL_012 - Valid username with wrong password is rejected', async ({ page, clientLoginPage }) => {
      test.info().annotations.push({
        type: 'VTS bug',
        description: 'Shows the raw text "logInAttemptCount ::N" instead of a user-friendly message, and differs from the unknown-user message (reveals which usernames exist).',
      });
      await clientLoginPage.loginWithCaptcha(client.username, neg.invalidPassword);
      await expect(page.getByText(/logInAttemptCount|invalid/i)).toBeVisible();
      await expect(page).toHaveURL(/\/login$/);
    });
  });

  // ───────────────────────────── Positive scenarios ────────────────────────────

  test.describe('Positive scenarios', () => {
    test('CL_013 - Valid credentials log in to the client dashboard (also resets the failed-attempt counter)', async ({ page, clientLoginPage, dashboardPage }) => {
      await clientLoginPage.loginWithCaptcha(client.username, client.password);
      await expect(page).toHaveURL(/dashboard\/home/, { timeout: 60_000 });
      await expect(dashboardPage.welcomeHeading).toBeVisible();
      await expect(page.getByRole('button', { name: 'Create New Case' })).toBeVisible();
      await expect(dashboardPage.logoutButton).toBeVisible();
    });

    test('CL_014 - Logout "Stay On" keeps the user on the dashboard', async ({ page, clientLoginPage, dashboardPage }) => {
      await clientLoginPage.loginWithCaptcha(client.username, client.password);
      await expect(page).toHaveURL(/dashboard\/home/, { timeout: 60_000 });
      await dashboardPage.logoutButton.click();
      await dashboardPage.stayOnButton.click();
      await expect(dashboardPage.stayOnButton).toBeHidden();
      await expect(page).toHaveURL(/dashboard\/home/);
      await expect(dashboardPage.welcomeHeading).toBeVisible();
    });

    test('CL_015 - Logout ends the session; dashboard is no longer accessible', async ({ page, clientLoginPage, dashboardPage }) => {
      await clientLoginPage.loginWithCaptcha(client.username, client.password);
      await expect(page).toHaveURL(/dashboard\/home/, { timeout: 60_000 });
      await dashboardPage.logout();
      await expect(page).toHaveURL(/kryacheck\.com\/$/);
      await page.goto('/dashboard/home', { waitUntil: 'domcontentloaded' });
      await expect(page).toHaveURL(/\/login$/, { timeout: 30_000 });
    });

    test('CL_016 - Logging in while already logged in elsewhere asks to continue, then takes over', async ({ page, browser, clientLoginPage }) => {
      // First session
      await clientLoginPage.loginWithCaptcha(client.username, client.password);
      await expect(page).toHaveURL(/dashboard\/home/, { timeout: 60_000 });

      // Second session in a separate browser context
      const otherContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      const otherPage = await otherContext.newPage();
      const otherLanding = new LandingPage(otherPage);
      const otherLogin = new ClientLoginPage(otherPage);
      await otherLanding.goto();
      await otherLanding.clickClientLogin();
      await otherLogin.verifyClientLoginPageLoaded();
      await otherLogin.usernameInput.fill(client.username);
      await otherLogin.passwordInput.fill(client.password);
      await otherLogin.fillCaptchaFromApi();
      await otherLogin.loginButton.click();

      await expect(otherPage.getByText('do you want to continue this user account')).toBeVisible();
      await otherLogin.continueSessionButton.click();
      await expect(otherPage).toHaveURL(/dashboard\/home/, { timeout: 60_000 });
      await expect(new DashboardPage(otherPage).welcomeHeading).toBeVisible();
      await otherContext.close();
    });
  });

  // ───────────────────────────── Forgot password ───────────────────────────────

  test.describe('Forgot password', () => {
    test('CL_017 - Forgot password opens a reset dialog with Submit disabled', async ({ clientLoginPage }) => {
      await clientLoginPage.openForgotPassword();
      await expect(clientLoginPage.forgotUsernameInput).toBeVisible();
      await expect(clientLoginPage.forgotCaptchaInput).toBeVisible();
      await expect(clientLoginPage.forgotSubmitButton).toBeDisabled();
      await expect(clientLoginPage.forgotCancelButton).toBeEnabled();
    });

    test('CL_018 - Cancel closes the forgot password dialog', async ({ clientLoginPage }) => {
      await clientLoginPage.openForgotPassword();
      await clientLoginPage.forgotCancelButton.click();
      await expect(clientLoginPage.forgotPasswordDialog).toBeHidden();
      await expect(clientLoginPage.loginButton).toBeVisible();
    });

    test('CL_019 - Forgot password for an unknown user shows "not exists"', async ({ clientLoginPage }) => {
      // Only an unknown user is submitted — a real user would trigger a real password reset
      await clientLoginPage.openForgotPassword();
      await clientLoginPage.forgotUsernameInput.fill(`${unknownUser()}@example.com`);
      const dialogCaptcha = clientLoginPage.forgotPasswordDialog.getByRole('img');
      await clientLoginPage.forgotCaptchaInput.fill(await clientLoginPage.currentCaptchaAnswer(dialogCaptcha));
      await clientLoginPage.forgotSubmitButton.click();
      await expect(clientLoginPage.forgotUnknownUserMessage).toBeVisible();
    });
  });
});

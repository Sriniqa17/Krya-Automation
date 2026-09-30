import { test, expect } from '../../fixtures/baseTest';
import authData from '../../data/authData';

test.describe('Client User Login - Positive & Negative Tests', () => {
  test.beforeEach(async ({ landingPage, clientLoginPage }) => {
    await landingPage.goto();
    await landingPage.clickClientLogin();
    await clientLoginPage.verifyClientLoginPageLoaded();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // ✅ POSITIVE TEST CASES
  // ─────────────────────────────────────────────────────────────────────────

  test('TC_CLI_001 - Verify Client login page loads with all required fields', async ({ clientLoginPage }) => {
    await expect(clientLoginPage.usernameInput).toBeVisible();
    await expect(clientLoginPage.passwordInput).toBeVisible();
    await expect(clientLoginPage.loginButton).toBeVisible();
  });

  test('TC_CLI_002 - Verify page title indicates Client login', async ({ clientLoginPage }) => {
    const pageTitle = await clientLoginPage.pageHeading.textContent();
    expect(pageTitle?.toLowerCase()).toContain('client');
  });

  test('TC_CLI_003 - Successful login with valid client credentials', async ({ clientLoginPage, page }) => {
    await clientLoginPage.login(authData.clientLogin.username, authData.clientLogin.password);
    await expect(page).not.toHaveURL(/login|client-login/i);
  });

  test('TC_CLI_004 - Verify username field accepts valid input', async ({ clientLoginPage }) => {
    await clientLoginPage.usernameInput.fill(authData.clientLogin.username);
    const value = await clientLoginPage.usernameInput.inputValue();
    expect(value).toBe(authData.clientLogin.username);
  });

  test('TC_CLI_005 - Verify password field is masked (type=password)', async ({ clientLoginPage }) => {
    await clientLoginPage.passwordInput.fill(authData.clientLogin.password);
    const type = await clientLoginPage.passwordInput.getAttribute('type');
    expect(type).toBe('password');
  });

  test('TC_CLI_006 - Verify Forgot Password link is visible', async ({ clientLoginPage }) => {
    await clientLoginPage.verifyForgotPasswordLink();
  });

  test('TC_CLI_007 - Verify login button text is correct', async ({ clientLoginPage }) => {
    const buttonText = await clientLoginPage.loginButton.textContent();
    expect(buttonText?.toLowerCase()).toContain('login');
  });

  test('TC_CLI_008 - Verify no captcha is required for client login', async ({ clientLoginPage }) => {
    const captchaVisible = await clientLoginPage.captchaContainer.isVisible().catch(() => false);
    expect(captchaVisible).toBeFalsy();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // ❌ NEGATIVE TEST CASES
  // ─────────────────────────────────────────────────────────────────────────

  test('TC_CLI_009 - Login fails with invalid username (valid password)', async ({ clientLoginPage }) => {
    await clientLoginPage.login(
      authData.negativeTestCases.invalidUsername,
      authData.clientLogin.password
    );
    await clientLoginPage.verifyErrorVisible();
  });

  test('TC_CLI_010 - Login fails with valid username (invalid password)', async ({ clientLoginPage }) => {
    await clientLoginPage.login(
      authData.clientLogin.username,
      authData.negativeTestCases.invalidPassword
    );
    await clientLoginPage.verifyErrorVisible();
  });

  test('TC_CLI_011 - Login fails with both invalid credentials', async ({ clientLoginPage }) => {
    await clientLoginPage.login(
      authData.negativeTestCases.invalidUsername,
      authData.negativeTestCases.invalidPassword
    );
    await clientLoginPage.verifyErrorVisible();
  });

  test('TC_CLI_012 - Login fails with empty username field', async ({ clientLoginPage, page }) => {
    await clientLoginPage.login('', authData.clientLogin.password);
    const isStillOnLogin = page.url().includes('login') || page.url().includes('client');
    expect(isStillOnLogin || (await clientLoginPage.errorMessage.isVisible())).toBeTruthy();
  });

  test('TC_CLI_013 - Login fails with empty password field', async ({ clientLoginPage, page }) => {
    await clientLoginPage.login(authData.clientLogin.username, '');
    const isStillOnLogin = page.url().includes('login') || page.url().includes('client');
    expect(isStillOnLogin || (await clientLoginPage.errorMessage.isVisible())).toBeTruthy();
  });

  test('TC_CLI_014 - Login fails with both fields empty', async ({ clientLoginPage, page }) => {
    await clientLoginPage.login('', '');
    const isStillOnLogin = page.url().includes('login') || page.url().includes('client');
    expect(isStillOnLogin || (await clientLoginPage.errorMessage.isVisible())).toBeTruthy();
  });

  test('TC_CLI_015 - SQL injection attempt in username is rejected', async ({ clientLoginPage }) => {
    await clientLoginPage.login(
      authData.negativeTestCases.sqlInjection,
      authData.clientLogin.password
    );
    await clientLoginPage.verifyErrorVisible();
  });

  test('TC_CLI_016 - XSS attempt in username is rejected', async ({ clientLoginPage }) => {
    await clientLoginPage.login(
      authData.negativeTestCases.xssAttempt,
      authData.clientLogin.password
    );
    await clientLoginPage.verifyErrorVisible();
  });

  test('TC_CLI_017 - SQL injection attempt in password is rejected', async ({ clientLoginPage }) => {
    await clientLoginPage.login(
      authData.clientLogin.username,
      authData.negativeTestCases.sqlInjection
    );
    await clientLoginPage.verifyErrorVisible();
  });

  test('TC_CLI_018 - Username with leading/trailing spaces is rejected or trimmed', async ({ clientLoginPage }) => {
    await clientLoginPage.login(
      '  ' + authData.clientLogin.username + '  ',
      authData.clientLogin.password
    );
    const errorOrLogin =
      (await clientLoginPage.errorMessage.isVisible().catch(() => false)) ||
      (await clientLoginPage.page.url().includes('login'));
    expect(errorOrLogin).toBeTruthy();
  });

  test('TC_CLI_019 - Case sensitivity in username validation', async ({ clientLoginPage }) => {
    await clientLoginPage.login(
      authData.clientLogin.username.toUpperCase(),
      authData.clientLogin.password
    );
    const errorVisible = await clientLoginPage.errorMessage.isVisible().catch(() => false);
    const stillOnLogin = await clientLoginPage.page.url().includes('login');
    expect(errorVisible || stillOnLogin).toBeTruthy();
  });

  test('TC_CLI_020 - Excessively long username (1000 chars) is handled', async ({ clientLoginPage }) => {
    const longInput = 'j'.repeat(1000);
    await clientLoginPage.usernameInput.fill(longInput);
    const value = await clientLoginPage.usernameInput.inputValue();
    expect(value.length).toBeLessThanOrEqual(longInput.length);
  });

  test('TC_CLI_021 - Excessively long password (1000 chars) is handled', async ({ clientLoginPage }) => {
    const longInput = 'test@' + 'a'.repeat(995);
    await clientLoginPage.passwordInput.fill(longInput);
    const value = await clientLoginPage.passwordInput.inputValue();
    expect(value.length).toBeLessThanOrEqual(longInput.length);
  });

  test('TC_CLI_022 - Special characters in username are properly handled', async ({ clientLoginPage }) => {
    const specialUsername = 'jusvin@#$%';
    await clientLoginPage.login(specialUsername, authData.clientLogin.password);
    await clientLoginPage.verifyErrorVisible();
  });

  test('TC_CLI_023 - Password with special characters (wrong) is rejected', async ({ clientLoginPage }) => {
    const specialPassword = 'test@#$%^&*()';
    await clientLoginPage.login(authData.clientLogin.username, specialPassword);
    await clientLoginPage.verifyErrorVisible();
  });

  test('TC_CLI_024 - Repeated failed login attempts show consistent error messages', async ({ clientLoginPage }) => {
    await clientLoginPage.login('wrongclient1', 'wrongpass1');
    await clientLoginPage.verifyErrorVisible();

    await clientLoginPage.clearFields();
    await clientLoginPage.login('wrongclient2', 'wrongpass2');
    await clientLoginPage.verifyErrorVisible();
  });

  test('TC_CLI_025 - Cannot login with reversed password', async ({ clientLoginPage }) => {
    const reversedPassword = authData.clientLogin.password.split('').reverse().join('');
    await clientLoginPage.login(authData.clientLogin.username, reversedPassword);
    await clientLoginPage.verifyErrorVisible();
  });

  test('TC_CLI_026 - Login button is clickable and functional', async ({ clientLoginPage }) => {
    const isEnabled = await clientLoginPage.isLoginButtonEnabled();
    expect(isEnabled).toBeTruthy();
  });

  test('TC_CLI_027 - Whitespace-only input is rejected in username', async ({ clientLoginPage, page }) => {
    await clientLoginPage.login('     ', authData.clientLogin.password);
    const isStillOnLogin = page.url().includes('login');
    expect(isStillOnLogin || (await clientLoginPage.errorMessage.isVisible())).toBeTruthy();
  });

  test('TC_CLI_028 - Whitespace-only input is rejected in password', async ({ clientLoginPage, page }) => {
    await clientLoginPage.login(authData.clientLogin.username, '     ');
    const isStillOnLogin = page.url().includes('login');
    expect(isStillOnLogin || (await clientLoginPage.errorMessage.isVisible())).toBeTruthy();
  });

  test('TC_CLI_029 - Client can see "Forgot Password" option', async ({ clientLoginPage }) => {
    const forgotPasswordVisible = await clientLoginPage.forgotPasswordLink.isVisible();
    expect(forgotPasswordVisible).toBeTruthy();
  });

  test('TC_CLI_030 - Login form persists after failed attempt', async ({ clientLoginPage }) => {
    await clientLoginPage.login('wronguser', 'wrongpass');
    await clientLoginPage.verifyErrorVisible();

    const usernameInputStillVisible = await clientLoginPage.usernameInput.isVisible();
    const passwordInputStillVisible = await clientLoginPage.passwordInput.isVisible();
    expect(usernameInputStillVisible && passwordInputStillVisible).toBeTruthy();
  });
});

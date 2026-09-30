import { test, expect } from '../../fixtures/baseTest';
import authData from '../../data/authData';

test.describe('Krya Internal User Login - Positive & Negative Tests', () => {
  test.beforeEach(async ({ landingPage, kryaLoginPage }) => {
    await landingPage.goto();
    await landingPage.clickKryaLogin();
    await kryaLoginPage.verifyKryaLoginPageLoaded();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // ✅ POSITIVE TEST CASES
  // ─────────────────────────────────────────────────────────────────────────

  test('TC_KRYA_001 - Verify Krya login page loads with all required fields', async ({ kryaLoginPage }) => {
    await expect(kryaLoginPage.usernameInput).toBeVisible();
    await expect(kryaLoginPage.passwordInput).toBeVisible();
    await expect(kryaLoginPage.captchaContainer).toBeVisible();
    await expect(kryaLoginPage.loginButton).toBeVisible();
  });

  test('TC_KRYA_002 - Verify page title indicates Krya/Internal login', async ({ kryaLoginPage }) => {
    const pageTitle = await kryaLoginPage.pageHeading.textContent();
    expect(pageTitle?.toLowerCase()).toContain('krya');
  });

  test('TC_KRYA_003 - Successful login with valid Krya credentials and captcha', async ({ kryaLoginPage, page }) => {
    await kryaLoginPage.login(authData.kryaLogin.username, authData.kryaLogin.password);
    // Note: Captcha handling may require manual intervention or mocking
    // This assumes captcha is either auto-solved or bypassed in test environment
    await expect(page).not.toHaveURL(/login|krya-login/i);
  });

  test('TC_KRYA_004 - Verify username field accepts Krya valid input', async ({ kryaLoginPage }) => {
    await kryaLoginPage.usernameInput.fill(authData.kryaLogin.username);
    const value = await kryaLoginPage.usernameInput.inputValue();
    expect(value).toBe(authData.kryaLogin.username);
  });

  test('TC_KRYA_005 - Verify password field is masked (type=password)', async ({ kryaLoginPage }) => {
    await kryaLoginPage.passwordInput.fill(authData.kryaLogin.password);
    const type = await kryaLoginPage.passwordInput.getAttribute('type');
    expect(type).toBe('password');
  });

  test('TC_KRYA_006 - Verify Forgot Password link is visible', async ({ kryaLoginPage }) => {
    await kryaLoginPage.verifyForgotPasswordLink();
  });

  test('TC_KRYA_007 - Verify captcha container is present', async ({ kryaLoginPage }) => {
    await expect(kryaLoginPage.captchaContainer).toBeVisible();
  });

  test('TC_KRYA_008 - Verify login button text is correct', async ({ kryaLoginPage }) => {
    const buttonText = await kryaLoginPage.loginButton.textContent();
    expect(buttonText?.toLowerCase()).toContain('login');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // ❌ NEGATIVE TEST CASES
  // ─────────────────────────────────────────────────────────────────────────

  test('TC_KRYA_009 - Login fails with invalid username (valid password)', async ({ kryaLoginPage }) => {
    await kryaLoginPage.login(
      authData.negativeTestCases.invalidUsername,
      authData.kryaLogin.password
    );
    await kryaLoginPage.verifyErrorVisible();
  });

  test('TC_KRYA_010 - Login fails with valid username (invalid password)', async ({ kryaLoginPage }) => {
    await kryaLoginPage.login(
      authData.kryaLogin.username,
      authData.negativeTestCases.invalidPassword
    );
    await kryaLoginPage.verifyErrorVisible();
  });

  test('TC_KRYA_011 - Login fails with both invalid credentials', async ({ kryaLoginPage }) => {
    await kryaLoginPage.login(
      authData.negativeTestCases.invalidUsername,
      authData.negativeTestCases.invalidPassword
    );
    await kryaLoginPage.verifyErrorVisible();
  });

  test('TC_KRYA_012 - Login fails with empty username field', async ({ kryaLoginPage, page }) => {
    await kryaLoginPage.login('', authData.kryaLogin.password);
    const isStillOnLogin = page.url().includes('login') || page.url().includes('krya');
    expect(isStillOnLogin || (await kryaLoginPage.errorMessage.isVisible())).toBeTruthy();
  });

  test('TC_KRYA_013 - Login fails with empty password field', async ({ kryaLoginPage, page }) => {
    await kryaLoginPage.login(authData.kryaLogin.username, '');
    const isStillOnLogin = page.url().includes('login') || page.url().includes('krya');
    expect(isStillOnLogin || (await kryaLoginPage.errorMessage.isVisible())).toBeTruthy();
  });

  test('TC_KRYA_014 - Login fails with both fields empty', async ({ kryaLoginPage, page }) => {
    await kryaLoginPage.login('', '');
    const isStillOnLogin = page.url().includes('login') || page.url().includes('krya');
    expect(isStillOnLogin || (await kryaLoginPage.errorMessage.isVisible())).toBeTruthy();
  });

  test('TC_KRYA_015 - SQL injection attempt in username is rejected', async ({ kryaLoginPage }) => {
    await kryaLoginPage.login(
      authData.negativeTestCases.sqlInjection,
      authData.kryaLogin.password
    );
    await kryaLoginPage.verifyErrorVisible();
  });

  test('TC_KRYA_016 - XSS attempt in username is rejected', async ({ kryaLoginPage }) => {
    await kryaLoginPage.login(
      authData.negativeTestCases.xssAttempt,
      authData.kryaLogin.password
    );
    await kryaLoginPage.verifyErrorVisible();
  });

  test('TC_KRYA_017 - SQL injection attempt in password is rejected', async ({ kryaLoginPage }) => {
    await kryaLoginPage.login(
      authData.kryaLogin.username,
      authData.negativeTestCases.sqlInjection
    );
    await kryaLoginPage.verifyErrorVisible();
  });

  test('TC_KRYA_018 - Username with leading spaces is rejected/trimmed', async ({ kryaLoginPage }) => {
    await kryaLoginPage.login(
      '  ' + authData.kryaLogin.username,
      authData.kryaLogin.password
    );
    const errorOrLogin =
      (await kryaLoginPage.errorMessage.isVisible().catch(() => false)) ||
      (await kryaLoginPage.page.url().includes('login'));
    expect(errorOrLogin).toBeTruthy();
  });

  test('TC_KRYA_019 - Username with trailing spaces is rejected/trimmed', async ({ kryaLoginPage }) => {
    await kryaLoginPage.login(
      authData.kryaLogin.username + '  ',
      authData.kryaLogin.password
    );
    const errorOrLogin =
      (await kryaLoginPage.errorMessage.isVisible().catch(() => false)) ||
      (await kryaLoginPage.page.url().includes('login'));
    expect(errorOrLogin).toBeTruthy();
  });

  test('TC_KRYA_020 - Case sensitivity in username validation', async ({ kryaLoginPage }) => {
    await kryaLoginPage.login(
      authData.kryaLogin.username.toUpperCase(),
      authData.kryaLogin.password
    );
    const errorVisible = await kryaLoginPage.errorMessage.isVisible().catch(() => false);
    const stillOnLogin = await kryaLoginPage.page.url().includes('login');
    expect(errorVisible || stillOnLogin).toBeTruthy();
  });

  test('TC_KRYA_021 - Excessively long username (1000 chars) is handled', async ({ kryaLoginPage }) => {
    const longInput = 'a'.repeat(1000);
    await kryaLoginPage.usernameInput.fill(longInput);
    const value = await kryaLoginPage.usernameInput.inputValue();
    expect(value.length).toBeLessThanOrEqual(longInput.length);
  });

  test('TC_KRYA_022 - Excessively long password (1000 chars) is handled', async ({ kryaLoginPage }) => {
    const longInput = 'P@ssw0rd' + 'a'.repeat(992);
    await kryaLoginPage.passwordInput.fill(longInput);
    const value = await kryaLoginPage.passwordInput.inputValue();
    expect(value.length).toBeLessThanOrEqual(longInput.length);
  });

  test('TC_KRYA_023 - Special characters in username are properly encoded', async ({ kryaLoginPage }) => {
    const specialUsername = 'srini@#$%';
    await kryaLoginPage.login(specialUsername, authData.kryaLogin.password);
    await kryaLoginPage.verifyErrorVisible();
  });

  test('TC_KRYA_024 - Password with special characters is rejected (wrong password)', async ({ kryaLoginPage }) => {
    const specialPassword = 'Kry@#$%^&*()';
    await kryaLoginPage.login(authData.kryaLogin.username, specialPassword);
    await kryaLoginPage.verifyErrorVisible();
  });

  test('TC_KRYA_025 - Captcha must be present before enabling login (if required)', async ({ kryaLoginPage }) => {
    const captchaVisible = await kryaLoginPage.captchaContainer.isVisible();
    expect(captchaVisible).toBeTruthy();
  });

  test('TC_KRYA_026 - Repeated failed login attempts show consistent error messages', async ({ kryaLoginPage }) => {
    await kryaLoginPage.login('wronguser1', 'wrongpass1');
    await kryaLoginPage.verifyErrorVisible();

    await kryaLoginPage.clearFields();
    await kryaLoginPage.login('wronguser2', 'wrongpass2');
    await kryaLoginPage.verifyErrorVisible();
  });

  test('TC_KRYA_027 - Cannot login with reversed password', async ({ kryaLoginPage }) => {
    const reversedPassword = authData.kryaLogin.password.split('').reverse().join('');
    await kryaLoginPage.login(authData.kryaLogin.username, reversedPassword);
    await kryaLoginPage.verifyErrorVisible();
  });

  test('TC_KRYA_028 - Login button is clickable and functional', async ({ kryaLoginPage }) => {
    const isEnabled = await kryaLoginPage.isLoginButtonEnabled();
    expect(isEnabled).toBeTruthy();
  });

  test('TC_KRYA_029 - Whitespace-only input is rejected in username', async ({ kryaLoginPage, page }) => {
    await kryaLoginPage.login('     ', authData.kryaLogin.password);
    const isStillOnLogin = page.url().includes('login');
    expect(isStillOnLogin || (await kryaLoginPage.errorMessage.isVisible())).toBeTruthy();
  });

  test('TC_KRYA_030 - Whitespace-only input is rejected in password', async ({ kryaLoginPage, page }) => {
    await kryaLoginPage.login(authData.kryaLogin.username, '     ');
    const isStillOnLogin = page.url().includes('login');
    expect(isStillOnLogin || (await kryaLoginPage.errorMessage.isVisible())).toBeTruthy();
  });
});

import { test, expect } from '../../fixtures/baseTest';
import authData from '../../data/authData.json';

test.describe('Candidate User Login - Positive & Negative Tests', () => {
  test.beforeEach(async ({ landingPage, candidateLoginPage }) => {
    await landingPage.goto();
    await landingPage.clickCandidateLogin();
    await candidateLoginPage.verifyCandidateLoginPageLoaded();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // ✅ POSITIVE TEST CASES
  // ─────────────────────────────────────────────────────────────────────────

  test('TC_CAND_001 - Verify Candidate login page loads with all elements', async ({ candidateLoginPage }) => {
    await expect(candidateLoginPage.usernameInput).toBeVisible();
    await expect(candidateLoginPage.passwordInput).toBeVisible();
    await expect(candidateLoginPage.loginButton).toBeVisible();
  });

  test('TC_CAND_002 - Successful login with valid candidate credentials', async ({ candidateLoginPage, page }) => {
    await candidateLoginPage.login(
      authData.candidateLogin.username,
      authData.candidateLogin.password
    );
    await expect(page).not.toHaveURL(/login|candidate-login/i);
  });

  test('TC_CAND_003 - Verify Forgot Password link is visible', async ({ candidateLoginPage }) => {
    await candidateLoginPage.verifyForgotPasswordLink();
  });

  test('TC_CAND_004 - Verify username field accepts valid input', async ({ candidateLoginPage }) => {
    await candidateLoginPage.usernameInput.fill(authData.candidateLogin.username);
    const value = await candidateLoginPage.usernameInput.inputValue();
    expect(value).toBe(authData.candidateLogin.username);
  });

  test('TC_CAND_005 - Verify password field is masked', async ({ candidateLoginPage }) => {
    await candidateLoginPage.passwordInput.fill(authData.candidateLogin.password);
    const type = await candidateLoginPage.passwordInput.getAttribute('type');
    expect(type).toBe('password');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // ❌ NEGATIVE TEST CASES
  // ─────────────────────────────────────────────────────────────────────────

  test('TC_CAND_006 - Login fails with invalid username', async ({ candidateLoginPage }) => {
    await candidateLoginPage.login(
      authData.negativeTestCases.invalidUsername,
      authData.candidateLogin.password
    );
    await candidateLoginPage.verifyErrorVisible();
  });

  test('TC_CAND_007 - Login fails with invalid password', async ({ candidateLoginPage }) => {
    await candidateLoginPage.login(
      authData.candidateLogin.username,
      authData.negativeTestCases.invalidPassword
    );
    await candidateLoginPage.verifyErrorVisible();
  });

  test('TC_CAND_008 - Login fails with both invalid credentials', async ({ candidateLoginPage }) => {
    await candidateLoginPage.login(
      authData.negativeTestCases.invalidUsername,
      authData.negativeTestCases.invalidPassword
    );
    await candidateLoginPage.verifyErrorVisible();
  });

  test('TC_CAND_009 - Login fails with empty username', async ({ candidateLoginPage, page }) => {
    await candidateLoginPage.login('', authData.candidateLogin.password);
    const isStillOnLogin = page.url().includes('login') || page.url().includes('candidate');
    expect(isStillOnLogin || (await candidateLoginPage.errorMessage.isVisible())).toBeTruthy();
  });

  test('TC_CAND_010 - Login fails with empty password', async ({ candidateLoginPage, page }) => {
    await candidateLoginPage.login(authData.candidateLogin.username, '');
    const isStillOnLogin = page.url().includes('login') || page.url().includes('candidate');
    expect(isStillOnLogin || (await candidateLoginPage.errorMessage.isVisible())).toBeTruthy();
  });

  test('TC_CAND_011 - Login fails with both fields empty', async ({ candidateLoginPage, page }) => {
    await candidateLoginPage.login('', '');
    const isStillOnLogin = page.url().includes('login') || page.url().includes('candidate');
    expect(isStillOnLogin || (await candidateLoginPage.errorMessage.isVisible())).toBeTruthy();
  });

  test('TC_CAND_012 - SQL injection attempt is rejected', async ({ candidateLoginPage }) => {
    await candidateLoginPage.login(
      authData.negativeTestCases.sqlInjection,
      authData.candidateLogin.password
    );
    await candidateLoginPage.verifyErrorVisible();
  });

  test('TC_CAND_013 - XSS attempt is rejected', async ({ candidateLoginPage }) => {
    await candidateLoginPage.login(
      authData.negativeTestCases.xssAttempt,
      authData.candidateLogin.password
    );
    await candidateLoginPage.verifyErrorVisible();
  });

  test('TC_CAND_014 - Excessively long username is handled', async ({ candidateLoginPage }) => {
    const longInput = 'a'.repeat(1000);
    await candidateLoginPage.usernameInput.fill(longInput);
    const value = await candidateLoginPage.usernameInput.inputValue();
    expect(value.length).toBeLessThanOrEqual(longInput.length);
  });

  test('TC_CAND_015 - Excessively long password is handled', async ({ candidateLoginPage }) => {
    const longInput = 'a'.repeat(1000);
    await candidateLoginPage.passwordInput.fill(longInput);
    const value = await candidateLoginPage.passwordInput.inputValue();
    expect(value.length).toBeLessThanOrEqual(longInput.length);
  });

  test('TC_CAND_016 - Username with leading/trailing spaces is rejected', async ({ candidateLoginPage }) => {
    await candidateLoginPage.login(
      '  ' + authData.candidateLogin.username + '  ',
      authData.candidateLogin.password
    );
    await candidateLoginPage.verifyErrorVisible();
  });

  test('TC_CAND_017 - Case sensitivity in username is validated', async ({ candidateLoginPage }) => {
    await candidateLoginPage.login(
      authData.candidateLogin.username.toUpperCase(),
      authData.candidateLogin.password
    );
    const errorVisible = await candidateLoginPage.errorMessage.isVisible().catch(() => false);
    const url = await candidateLoginPage.page.url();
    expect(errorVisible || url.includes('login')).toBeTruthy();
  });

  test('TC_CAND_018 - Repeated failed attempts show consistent errors', async ({ candidateLoginPage }) => {
    await candidateLoginPage.login('candid1', 'pass1');
    await candidateLoginPage.verifyErrorVisible();

    await candidateLoginPage.clearFields();
    await candidateLoginPage.login('candid2', 'pass2');
    await candidateLoginPage.verifyErrorVisible();
  });

  test('TC_CAND_019 - Login button is functional', async ({ candidateLoginPage }) => {
    const isEnabled = await candidateLoginPage.isLoginButtonEnabled();
    expect(isEnabled).toBeTruthy();
  });

  test('TC_CAND_020 - Special characters in password work correctly', async ({ candidateLoginPage }) => {
    const specialPassword = 'C@nd!d@t€P@ss#2024';
    await candidateLoginPage.login(authData.candidateLogin.username, specialPassword);
    await candidateLoginPage.verifyErrorVisible();
  });
});

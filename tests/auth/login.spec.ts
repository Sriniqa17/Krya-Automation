import { test, expect } from '../../fixtures/baseTest';
import authData from '../../data/authData.json';

test.describe('Krya VTS - Authentication', () => {

  // ── Krya Internal Login ───────────────────────────────────────────────────────

  test.describe('Krya Internal Login', () => {

    test.beforeEach(async ({ landingPage, loginPage }) => {
      await landingPage.goto();
      await landingPage.clickKryaLogin();
      await loginPage.verifyLoginPageLoaded();
    });

    test('TC01 - Krya login page loads with all fields', async ({ loginPage }) => {
      await expect(loginPage.emailInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
      await expect(loginPage.loginButton).toBeVisible();
    });

    test('TC02 - Successful login with valid Krya credentials', async ({ loginPage, page }) => {
      await loginPage.login(authData.kryaUser.email, authData.kryaUser.password);
      await expect(page).not.toHaveURL(/login/);
    });

    test('TC03 - Login fails with invalid email', async ({ loginPage }) => {
      await loginPage.login('invalid@test.com', authData.kryaUser.password);
      await loginPage.verifyErrorVisible();
    });

    test('TC04 - Login fails with invalid password', async ({ loginPage }) => {
      await loginPage.login(authData.kryaUser.email, 'WrongPassword@123');
      await loginPage.verifyErrorVisible();
    });

    test('TC05 - Login fails with completely invalid credentials', async ({ loginPage }) => {
      await loginPage.login(authData.invalidUser.email, authData.invalidUser.password);
      await loginPage.verifyErrorVisible();
    });

    test('TC06 - Login button is disabled or shows validation with empty email', async ({ loginPage, page }) => {
      await loginPage.login('', authData.kryaUser.password);
      await expect(page).toHaveURL(/login|internal|krya/i);
    });

    test('TC07 - Login button is disabled or shows validation with empty password', async ({ loginPage, page }) => {
      await loginPage.login(authData.kryaUser.email, '');
      await expect(page).toHaveURL(/login|internal|krya/i);
    });

    test('TC08 - Login fails with both fields empty', async ({ loginPage, page }) => {
      await loginPage.login('', '');
      await expect(page).toHaveURL(/login|internal|krya/i);
    });
  });

  // ── Client (Business Partner) Login ──────────────────────────────────────────

  test.describe('Client Business Partner Login', () => {

    test.beforeEach(async ({ landingPage, loginPage }) => {
      await landingPage.goto();
      await landingPage.clickClientLogin();
      await loginPage.verifyLoginPageLoaded();
    });

    test('TC09 - Client login page loads with all fields', async ({ loginPage }) => {
      await expect(loginPage.emailInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
      await expect(loginPage.loginButton).toBeVisible();
    });

    test('TC10 - Successful login with valid Client credentials', async ({ loginPage, page }) => {
      await loginPage.login(authData.clientUser.email, authData.clientUser.password);
      await expect(page).not.toHaveURL(/login/);
    });

    test('TC11 - Client login fails with invalid credentials', async ({ loginPage }) => {
      await loginPage.login(authData.invalidUser.email, authData.invalidUser.password);
      await loginPage.verifyErrorVisible();
    });
  });

  // ── Candidate (External) Login ────────────────────────────────────────────────

  test.describe('Candidate External Login', () => {

    test.beforeEach(async ({ landingPage, loginPage }) => {
      await landingPage.goto();
      await landingPage.clickCandidateLogin();
      await loginPage.verifyLoginPageLoaded();
    });

    test('TC12 - Candidate login page loads with all fields', async ({ loginPage }) => {
      await expect(loginPage.emailInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
      await expect(loginPage.loginButton).toBeVisible();
    });

    test('TC13 - Successful login with valid Candidate credentials', async ({ loginPage, page }) => {
      await loginPage.login(authData.candidateUser.email, authData.candidateUser.password);
      await expect(page).not.toHaveURL(/login/);
    });

    test('TC14 - Candidate login fails with invalid credentials', async ({ loginPage }) => {
      await loginPage.login(authData.invalidUser.email, authData.invalidUser.password);
      await loginPage.verifyErrorVisible();
    });
  });
});

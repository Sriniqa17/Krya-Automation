import { Page, Locator, expect } from '@playwright/test';

export class BaseLoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly forgotPasswordLink: Locator;
  readonly pageHeading: Locator;
  readonly captchaContainer: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('input[type="text"], input[name*="username" i], input[name*="user" i]');
    this.passwordInput = page.locator('input[type="password"]');
    this.loginButton = page.locator('button[type="submit"], button:has-text("Login")');
    this.errorMessage = page.locator('.error, .alert-danger, [role="alert"], .invalid-feedback, .error-message').first();
    this.forgotPasswordLink = page.getByRole('link', { name: /forgot password/i });
    this.pageHeading = page.getByRole('heading').first();
    this.captchaContainer = page.locator('[data-cy*="captcha" i], .captcha, .g-recaptcha, [class*="captcha"]');
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async verifyErrorVisible() {
    await expect(this.errorMessage).toBeVisible();
  }

  async verifyForgotPasswordLink() {
    await expect(this.forgotPasswordLink).toBeVisible();
  }

  async clearFields() {
    await this.usernameInput.clear();
    await this.passwordInput.clear();
  }

  async isLoginButtonEnabled() {
    return !(await this.loginButton.isDisabled().catch(() => false));
  }
}

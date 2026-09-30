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
  readonly captchaInput: Locator;
  readonly continueSessionButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByRole('textbox', { name: /username|email/i });
    this.passwordInput = page.locator('input[type="password"]');
    this.loginButton = page.getByRole('button', { name: /sign in|login/i });
    this.errorMessage = page.locator('.error, .alert-danger, [role="alert"], .invalid-feedback, .error-message').first();
    this.forgotPasswordLink = page.getByRole('link', { name: /forgot password/i });
    this.pageHeading = page.getByRole('heading').first();
    this.captchaContainer = page.getByRole('img', { name: /captcha/i });
    this.captchaInput = page.getByRole('textbox', { name: /captcha/i });
    // "Are you sure, do you want to continue this user account?" — shown when the user is already logged in elsewhere
    this.continueSessionButton = page.getByRole('button', { name: /yes, continue/i });
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /** Accepts the "already logged in elsewhere" dialog if it appears, closing the other session. */
  async confirmSessionTakeoverIfPrompted(timeout = 5000) {
    await this.continueSessionButton
      .click({ timeout })
      .catch(() => {}); // dialog not shown
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

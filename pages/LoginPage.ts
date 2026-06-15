import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly forgotPasswordLink: Locator;
  readonly pageHeading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[type="email"]');
    this.passwordInput = page.locator('input[type="password"]');
    this.loginButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('.error, .alert-danger, [role="alert"], .invalid-feedback').first();
    this.forgotPasswordLink = page.getByRole('link', { name: /forgot password/i });
    this.pageHeading = page.getByRole('heading').first();
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async verifyLoginPageLoaded() {
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }

  async verifyErrorVisible() {
    await expect(this.errorMessage).toBeVisible();
  }

  async verifyErrorMessage(expectedText: string) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(expectedText);
  }

  async clearAndLogin(email: string, password: string) {
    await this.emailInput.clear();
    await this.passwordInput.clear();
    await this.login(email, password);
  }
}

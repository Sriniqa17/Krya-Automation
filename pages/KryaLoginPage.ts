import { Page, Locator, expect } from '@playwright/test';
import { BaseLoginPage } from './BaseLoginPage';

export class KryaLoginPage extends BaseLoginPage {
  readonly kryaSpecificHeading: Locator;
  readonly internalUserLabel: Locator;

  constructor(page: Page) {
    super(page);
    this.kryaSpecificHeading = page.getByRole('heading', { name: /krya/i });
    this.internalUserLabel = page.getByText(/internal|krya/i);
  }

  async verifyKryaLoginPageLoaded() {
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
    await expect(this.captchaContainer).toBeVisible();
  }

  async verifyKryaPageIndicators() {
    const headingText = await this.pageHeading.textContent();
    expect(headingText?.toLowerCase()).toContain('krya');
  }
}

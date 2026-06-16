import { Page, Locator, expect } from '@playwright/test';
import { BaseLoginPage } from './BaseLoginPage';

export class ClientLoginPage extends BaseLoginPage {
  readonly clientSpecificHeading: Locator;
  readonly businessPartnerLabel: Locator;

  constructor(page: Page) {
    super(page);
    this.clientSpecificHeading = page.getByRole('heading', { name: /client/i });
    this.businessPartnerLabel = page.getByText(/business partner|client/i);
  }

  async verifyClientLoginPageLoaded() {
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }

  async verifyClientPageIndicators() {
    const headingText = await this.pageHeading.textContent();
    expect(headingText?.toLowerCase()).toContain('client');
  }

  async verifyNoCaptchaRequired() {
    const captchaVisible = await this.captchaContainer.isVisible().catch(() => false);
    expect(captchaVisible).toBeFalsy();
  }
}

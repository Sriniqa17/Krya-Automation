import { Page, Locator, expect } from '@playwright/test';
import { BaseLoginPage } from './BaseLoginPage';

export class CandidateLoginPage extends BaseLoginPage {
  readonly candidateSpecificHeading: Locator;
  readonly externalUserLabel: Locator;

  constructor(page: Page) {
    super(page);
    this.candidateSpecificHeading = page.getByRole('heading', { name: /candidate/i });
    this.externalUserLabel = page.getByText(/external|candidate/i);
  }

  async verifyCandidateLoginPageLoaded() {
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }

  async verifyCandidatePageIndicators() {
    const headingText = await this.pageHeading.textContent();
    expect(headingText?.toLowerCase()).toContain('candidate');
  }

  async verifyNoCaptchaRequired() {
    const captchaVisible = await this.captchaContainer.isVisible().catch(() => false);
    expect(captchaVisible).toBeFalsy();
  }
}

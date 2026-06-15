import { Page, Locator, expect } from '@playwright/test';

export class LandingPage {
  readonly page: Page;
  readonly logo: Locator;
  readonly helpButton: Locator;
  readonly getStartedButton: Locator;
  readonly heroHeading: Locator;
  readonly heroSubText: Locator;
  readonly welcomeText: Locator;
  readonly heroImage: Locator;
  readonly kryaLoginCard: Locator;
  readonly kryaLoginLabel: Locator;
  readonly clientLoginCard: Locator;
  readonly clientLoginLabel: Locator;
  readonly candidateLoginCard: Locator;
  readonly candidateLoginLabel: Locator;
  readonly footerCopyright: Locator;
  readonly privacyPoliciesLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.logo = page.locator('img[alt*="krya" i], .logo, header img').first();
    this.helpButton = page.getByRole('link', { name: /help/i }).or(page.getByText('Help').first());
    this.getStartedButton = page
      .getByRole('button', { name: /get started/i })
      .or(page.getByRole('link', { name: /get started/i }));
    this.heroHeading = page.getByRole('heading', { name: /verification tracking system/i });
    this.heroSubText = page.getByText(/helping organizations across the globe/i);
    this.welcomeText = page.getByText('Welcome To');
    this.heroImage = page.locator('.hero img, section img, .banner img').first();
    this.kryaLoginCard = page.getByText('Krya Login');
    this.kryaLoginLabel = page.getByText('Internal');
    this.clientLoginCard = page.getByText('Client Login');
    this.clientLoginLabel = page.getByText('Business Partner');
    this.candidateLoginCard = page.getByText('Candidate Login');
    this.candidateLoginLabel = page.getByText('External');
    this.footerCopyright = page.getByText(/Verification Tracking System.*Krya Screening/i);
    this.privacyPoliciesLink = page.getByRole('link', { name: /privacy policies/i });
  }

  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async verifyPageLoaded() {
    await expect(this.heroHeading).toBeVisible();
    await expect(this.kryaLoginCard).toBeVisible();
    await expect(this.clientLoginCard).toBeVisible();
    await expect(this.candidateLoginCard).toBeVisible();
  }

  async clickKryaLogin() {
    await this.kryaLoginCard.click();
    await this.page.waitForLoadState('networkidle');
  }

  async clickClientLogin() {
    await this.clientLoginCard.click();
    await this.page.waitForLoadState('networkidle');
  }

  async clickCandidateLogin() {
    await this.candidateLoginCard.click();
    await this.page.waitForLoadState('networkidle');
  }

  async clickGetStarted() {
    await this.getStartedButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async clickHelp() {
    await this.helpButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async clickPrivacyPolicies() {
    await this.privacyPoliciesLink.click();
    await this.page.waitForLoadState('networkidle');
  }
}

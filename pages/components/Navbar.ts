import { Page, Locator, expect } from '@playwright/test';

export class Navbar {
  readonly page: Page;
  readonly logo: Locator;
  readonly helpLink: Locator;
  readonly userMenuButton: Locator;
  readonly logoutOption: Locator;
  readonly navLinks: Locator;

  constructor(page: Page) {
    this.page = page;
    this.logo = page.locator('header img[alt*="krya" i], .navbar-brand img, .logo img').first();
    this.helpLink = page.getByRole('link', { name: /help/i });
    this.userMenuButton = page
      .locator('.user-menu, .profile, [data-testid="user-menu"], .avatar')
      .first();
    this.logoutOption = page
      .getByRole('menuitem', { name: /logout|sign out/i })
      .or(page.getByRole('button', { name: /logout/i }));
    this.navLinks = page.locator('nav a, header a');
  }

  async clickLogo() {
    await this.logo.click();
    await this.page.waitForLoadState('networkidle');
  }

  async clickHelp() {
    await this.helpLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  async openUserMenu() {
    await this.userMenuButton.click();
  }

  async logout() {
    await this.openUserMenu();
    await this.logoutOption.click();
    await this.page.waitForLoadState('networkidle');
  }

  async verifyVisible() {
    await expect(this.logo).toBeVisible();
  }
}

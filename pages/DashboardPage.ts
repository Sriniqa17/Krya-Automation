import { Page, Locator, expect } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly navbar: Locator;
  readonly sidebar: Locator;
  readonly pageHeading: Locator;
  readonly logoutButton: Locator;
  readonly userMenuButton: Locator;
  readonly profileMenu: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navbar = page.locator('nav, header').first();
    this.sidebar = page.locator('aside, .sidebar, [data-testid="sidebar"]').first();
    this.pageHeading = page.getByRole('heading').first();
    this.logoutButton = page
      .getByRole('button', { name: /logout|sign out/i })
      .or(page.getByRole('link', { name: /logout|sign out/i }));
    this.userMenuButton = page
      .locator('.user-menu, .profile-menu, [data-testid="user-menu"], .avatar')
      .first();
    this.profileMenu = page.locator('.dropdown-menu, .profile-dropdown').first();
  }

  async verifyDashboardLoaded() {
    await expect(this.navbar).toBeVisible();
    await expect(this.page).not.toHaveURL(/login/);
  }

  async logout() {
    try {
      await this.userMenuButton.click();
      await this.logoutButton.click();
    } catch {
      await this.logoutButton.click();
    }
    await this.page.waitForLoadState('networkidle');
  }

  async verifyLoggedOut() {
    await expect(this.page).toHaveURL(/login|\//);
  }
}

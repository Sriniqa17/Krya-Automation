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
    // VTS uses Angular Material: mat-toolbar header, mat-sidenav menu, icon-only logout button
    this.navbar = page.locator('mat-toolbar').first();
    this.sidebar = page.locator('mat-sidenav').first();
    this.pageHeading = page.getByRole('heading').first();
    this.logoutButton = page.locator('button[mattooltip="Logout"]');
    this.userMenuButton = page.locator('.user.mat-menu-trigger');
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

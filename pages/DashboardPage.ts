import { Page, Locator, expect } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly navbar: Locator;
  readonly sidebar: Locator;
  readonly pageHeading: Locator;
  readonly logoutButton: Locator;
  readonly userMenuButton: Locator;
  readonly profileMenu: Locator;
  readonly welcomeHeading: Locator;
  readonly confirmLogoutButton: Locator;
  readonly stayOnButton: Locator;

  constructor(page: Page) {
    this.page = page;
    // VTS uses Angular Material: mat-toolbar header, mat-sidenav menu, icon-only logout button
    this.navbar = page.locator('mat-toolbar').first();
    this.sidebar = page.locator('mat-sidenav').first();
    this.pageHeading = page.getByRole('heading').first();
    this.logoutButton = page.locator('button[mattooltip="Logout"]');
    this.userMenuButton = page.locator('.user.mat-menu-trigger');
    this.profileMenu = page.locator('.dropdown-menu, .profile-dropdown').first();
    this.welcomeHeading = page.getByRole('heading', { name: 'Welcome to Verification Tracking System Dashboard!' });
    // Logout asks: "Changes you made may not be saved. Do you want to Logout this session?"
    this.confirmLogoutButton = page.getByRole('button', { name: 'Yes, Logout' });
    this.stayOnButton = page.getByRole('button', { name: 'Stay On' });
  }

  async verifyDashboardLoaded() {
    await expect(this.navbar).toBeVisible();
    await expect(this.page).not.toHaveURL(/login/);
  }

  /** Clicks the sidebar Logout icon and confirms with "Yes, Logout". Lands on the landing page. */
  async logout() {
    await this.logoutButton.click();
    await this.confirmLogoutButton.click();
    await expect(this.page).not.toHaveURL(/dashboard/);
  }

  async verifyLoggedOut() {
    await expect(this.page).toHaveURL(/login|\//);
  }
}

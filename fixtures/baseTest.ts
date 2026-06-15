import { test as base } from '@playwright/test';
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { Navbar } from '../pages/components/Navbar';

type VtsPages = {
  landingPage: LandingPage;
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  navbar: Navbar;
};

export const test = base.extend<VtsPages>({
  landingPage: async ({ page }, use) => {
    await use(new LandingPage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  navbar: async ({ page }, use) => {
    await use(new Navbar(page));
  },
});

export { expect } from '@playwright/test';

import { test as base } from '@playwright/test';
import { LandingPage } from '../pages/LandingPage';
import { BaseLoginPage } from '../pages/BaseLoginPage';
import { KryaLoginPage } from '../pages/KryaLoginPage';
import { ClientLoginPage } from '../pages/ClientLoginPage';
import { CandidateLoginPage } from '../pages/CandidateLoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { Navbar } from '../pages/components/Navbar';

type VtsPages = {
  landingPage: LandingPage;
  baseLoginPage: BaseLoginPage;
  kryaLoginPage: KryaLoginPage;
  clientLoginPage: ClientLoginPage;
  candidateLoginPage: CandidateLoginPage;
  dashboardPage: DashboardPage;
  navbar: Navbar;
};

export const test = base.extend<VtsPages>({
  landingPage: async ({ page }, use) => {
    await use(new LandingPage(page));
  },
  baseLoginPage: async ({ page }, use) => {
    await use(new BaseLoginPage(page));
  },
  kryaLoginPage: async ({ page }, use) => {
    await use(new KryaLoginPage(page));
  },
  clientLoginPage: async ({ page }, use) => {
    await use(new ClientLoginPage(page));
  },
  candidateLoginPage: async ({ page }, use) => {
    await use(new CandidateLoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  navbar: async ({ page }, use) => {
    await use(new Navbar(page));
  },
});

export { expect } from '@playwright/test';

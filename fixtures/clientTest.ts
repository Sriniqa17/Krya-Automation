import { test as base } from './baseTest';
import authData from '../data/authData';
import { ClientDashboardPage } from '../pages/ClientDashboardPage';
import { ClientBulkCaseCreationPage } from '../pages/ClientBulkCaseCreationPage';

type ClientFixtures = {
  /** Logs in as the client user (captcha solved automatically) and lands on the client dashboard. */
  clientLoggedIn: void;
  clientDashboardPage: ClientDashboardPage;
  bulkCaseCreationPage: ClientBulkCaseCreationPage;
};

export const test = base.extend<ClientFixtures>({
  // Page objects are created before login so they can capture the dashboard API responses
  clientDashboardPage: async ({ page }, use) => {
    await use(new ClientDashboardPage(page));
  },
  bulkCaseCreationPage: async ({ page }, use) => {
    await use(new ClientBulkCaseCreationPage(page));
  },
  clientLoggedIn: async ({ landingPage, clientLoginPage, clientDashboardPage }, use) => {
    await landingPage.goto();
    await landingPage.clickClientLogin();
    await clientLoginPage.verifyClientLoginPageLoaded();
    await clientLoginPage.loginWithCaptcha(authData.clientLogin.username, authData.clientLogin.password);
    await clientDashboardPage.waitForLoaded();
    await use();
  },
});

export { expect } from '@playwright/test';

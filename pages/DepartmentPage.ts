import { Page, Locator, expect } from '@playwright/test';

/** "Choose Department" page shown to Krya internal users right after login (/deptChoose). */
export class DepartmentPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly proceedButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByText('Choose Department', { exact: true });
    this.proceedButton = page.getByRole('button', { name: 'Proceed' });
  }

  async goto() {
    await this.page.goto('/deptChoose', { waitUntil: 'domcontentloaded' });
    await expect(this.heading).toBeVisible();
  }

  /** Selects a department (e.g. "CRT India Department") and lands on the dashboard. */
  async chooseDepartment(department: string) {
    // The radio input is visually hidden behind its label, so click the label text
    await this.page.getByText(department, { exact: true }).click();
    await this.proceedButton.click();
    await this.page.waitForURL(/dashboard\/home/);
  }
}

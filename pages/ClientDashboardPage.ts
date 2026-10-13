import { Page, Locator, Response, expect } from '@playwright/test';

export type TileName = 'Pending Cases' | 'Completed Cases' | 'Submitted Cases';
export type ChartTab = 'Case Status Details' | 'Case Color Code Details' | 'Case WIP Details';
type NameValue = { name: string; value: number };

/** Client (Business Partner) dashboard: count tiles, case charts and the case lists behind the tiles. */
export class ClientDashboardPage {
  readonly page: Page;
  readonly welcomeHeading: Locator;
  readonly createNewCaseButton: Locator;
  readonly sectionHeadings: Locator;

  // Case list opened from a tile (/dashboard/verification/clientCases)
  readonly caseListPaginatorRange: Locator;
  readonly caseListSearch: Locator;

  /** Latest bodies of the dashboard count APIs, captured as the dashboard loads. */
  readonly api: {
    dashboardCount?: Record<string, unknown>;
    caseStatus?: NameValue[];
    colorCode?: NameValue[];
    wip?: NameValue[];
  } = {};

  constructor(page: Page) {
    this.page = page;
    this.welcomeHeading = page.getByRole('heading', { name: 'Welcome to Verification Tracking System Dashboard!' });
    this.createNewCaseButton = page.getByRole('button', { name: 'Create New Case' });
    this.sectionHeadings = page.getByRole('heading', { level: 3 });

    this.caseListPaginatorRange = page.locator('.mat-paginator-range-label');
    this.caseListSearch = page.getByPlaceholder('Search');

    page.on('response', (response) => this.captureApi(response));
  }

  private async captureApi(response: Response) {
    const url = response.url();
    const key =
      /DashBoard\/GetDashboardCount/i.test(url) ? 'dashboardCount' :
      /GetCaseStatusWiseCount/i.test(url) ? 'caseStatus' :
      /GetColorCodeWiseClosedCount/i.test(url) ? 'colorCode' :
      /GetWIPCasesCount/i.test(url) ? 'wip' : undefined;
    if (!key) return;
    try {
      this.api[key] = await response.json();
    } catch {
      // body unavailable (navigation)
    }
  }

  async waitForLoaded() {
    await expect(this.page).toHaveURL(/dashboard\/home/, { timeout: 60_000 });
    await expect(this.welcomeHeading).toBeVisible({ timeout: 60_000 });
    await expect(this.tileCountLocator('Pending Cases')).toHaveText(/\d+/, { timeout: 60_000 });
    await expect.poll(() => this.api.caseStatus, { timeout: 60_000 }).toBeTruthy();
  }

  /** The tile (label + number); the label is rendered upper-case by CSS. */
  tile(name: TileName) {
    return this.page.locator('a, mat-card, div').filter({ has: this.page.getByText(name, { exact: true }) })
      .filter({ hasText: /\d/ }).last();
  }

  private tileCountLocator(name: TileName) {
    return this.tile(name).getByText(/^\s*\d+\s*$/).first();
  }

  async tileCount(name: TileName) {
    return Number((await this.tileCountLocator(name).innerText()).trim());
  }

  async openTile(name: TileName) {
    await this.page.getByText(name, { exact: true }).click();
    await expect(this.page).toHaveURL(/verification\/clientCases/, { timeout: 60_000 });
    await expect(this.page.getByText(name, { exact: true }).first()).toBeVisible();
    await expect(this.caseListPaginatorRange).toHaveText(/of \d+/, { timeout: 60_000 });
  }

  /** Searches the opened case list. The search only applies on Enter. */
  async searchCases(text: string) {
    await this.caseListSearch.fill(text);
    await this.caseListSearch.press('Enter');
  }

  /** Total records in the opened case list, from "1 – 10 of 31". */
  async caseListTotal() {
    const text = await this.caseListPaginatorRange.innerText();
    return Number(text.match(/of\s+(\d+)/)![1]);
  }

  /**
   * The chart for a tab. All three tab charts stay in the DOM (and count as visible), so each
   * is identified by a legend label only it has.
   */
  chart(tab: ChartTab) {
    const label = { 'Case Status Details': /^\s*open\s*$/i, 'Case Color Code Details': /^\s*green\s*$/i, 'Case WIP Details': /^\s*bt\s*$/i }[tab];
    return this.page.locator('ngx-charts-advanced-pie-chart')
      .filter({ has: this.page.locator('.item-label').filter({ hasText: label }) }).first();
  }

  async openChartTab(tab: ChartTab) {
    await this.page.getByText(tab, { exact: true }).click();
    await expect(this.chart(tab)).toBeVisible();
  }

  async chartTotalValue(tab: ChartTab) {
    return Number((await this.chart(tab).locator('.total-value').innerText()).replace(/[^\d]/g, ''));
  }

  /** Legend items of a tab's chart as { LABEL: value }. */
  async chartLegend(tab: ChartTab) {
    const items = this.chart(tab).locator('.legend-item');
    const legend: Record<string, number> = {};
    for (let i = 0; i < (await items.count()); i++) {
      const label = (await items.nth(i).locator('.item-label').innerText()).trim().toUpperCase();
      legend[label] = Number((await items.nth(i).locator('.item-value').innerText()).replace(/[^\d]/g, ''));
    }
    return legend;
  }

  /** Value for a name in one of the captured API arrays (case-insensitive). */
  apiValue(list: NameValue[] | undefined, name: string) {
    return list?.find((item) => item.name.toLowerCase() === name.toLowerCase())?.value ?? NaN;
  }
}

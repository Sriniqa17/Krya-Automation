import { test, expect } from '../../fixtures/clientTest';
import type { TileName } from '../../pages/ClientDashboardPage';

/**
 * Client dashboard: tiles, charts and the case lists behind the tiles.
 * Counts change as cases move, so tests compare the UI against the dashboard APIs and
 * against each other instead of hard-coding numbers.
 */
test.describe('Client Dashboard', () => {
  test.describe.configure({ mode: 'default', timeout: 150_000 });
  test.use({ viewport: { width: 1280, height: 800 } });

  test.beforeEach(async ({ clientLoggedIn }) => {
    void clientLoggedIn;
  });

  test('CD_001 - Dashboard shows welcome, Create New Case, count tiles and sections', async ({ page, clientDashboardPage }) => {
    await expect(clientDashboardPage.welcomeHeading).toBeVisible();
    await expect(clientDashboardPage.createNewCaseButton).toBeVisible();
    for (const tile of ['Pending Cases', 'Completed Cases', 'Submitted Cases'] as TileName[]) {
      await expect(clientDashboardPage.tile(tile)).toBeVisible();
    }
    for (const section of ['Case Details', 'Insufficiency', 'Query', 'Verification']) {
      await expect(page.getByRole('heading', { name: new RegExp(`^${section}`) }).first()).toBeVisible();
    }
  });

  test('CD_002 - Tile counts match the dashboard APIs', async ({ clientDashboardPage }) => {
    const { api } = clientDashboardPage;
    const open = clientDashboardPage.apiValue(api.caseStatus, 'Open');
    const wip = clientDashboardPage.apiValue(api.caseStatus, 'WIP');
    const insufficiency = clientDashboardPage.apiValue(api.caseStatus, 'Insufficiency');
    const completed = clientDashboardPage.apiValue(api.caseStatus, 'Completed');

    expect(await clientDashboardPage.tileCount('Pending Cases'), 'Pending = Open + WIP + Insufficiency').toBe(open + wip + insufficiency);
    expect(await clientDashboardPage.tileCount('Completed Cases')).toBe(completed);
    expect(await clientDashboardPage.tileCount('Submitted Cases')).toBe(api.dashboardCount?.submittedCasesClient);
  });

  test('CD_003 - Case Status chart: legend matches API and adds up to the total', async ({ clientDashboardPage }) => {
    const tab = 'Case Status Details';
    await clientDashboardPage.openChartTab(tab);
    const legend = await clientDashboardPage.chartLegend(tab);
    const { caseStatus } = clientDashboardPage.api;
    for (const name of ['Open', 'Completed', 'WIP', 'Insufficiency']) {
      expect(legend[name.toUpperCase()], name).toBe(clientDashboardPage.apiValue(caseStatus, name));
    }
    const sum = Object.values(legend).reduce((a, b) => a + b, 0);
    expect(await clientDashboardPage.chartTotalValue(tab)).toBe(sum);
  });

  test('CD_004 - Case Color Code chart: Green + Red = total = Completed cases', async ({ clientDashboardPage }) => {
    const tab = 'Case Color Code Details';
    await clientDashboardPage.openChartTab(tab);
    const legend = await clientDashboardPage.chartLegend(tab);
    const { colorCode } = clientDashboardPage.api;
    expect(legend.GREEN).toBe(clientDashboardPage.apiValue(colorCode, 'Green'));
    expect(legend.RED).toBe(clientDashboardPage.apiValue(colorCode, 'Red'));
    const total = await clientDashboardPage.chartTotalValue(tab);
    expect(total).toBe(legend.GREEN + legend.RED);
    expect(total, 'closed cases by colour = Completed tile').toBe(await clientDashboardPage.tileCount('Completed Cases'));
  });

  test('CD_005 - Case WIP chart: NT + WT + CT + BT = total = WIP cases', async ({ clientDashboardPage }) => {
    const tab = 'Case WIP Details';
    await clientDashboardPage.openChartTab(tab);
    const legend = await clientDashboardPage.chartLegend(tab);
    const { wip, caseStatus } = clientDashboardPage.api;
    for (const name of ['NT', 'WT', 'CT', 'BT']) {
      expect(legend[name], name).toBe(clientDashboardPage.apiValue(wip, name));
    }
    const total = await clientDashboardPage.chartTotalValue(tab);
    expect(total).toBe(legend.NT + legend.WT + legend.CT + legend.BT);
    expect(total, 'WIP chart total = WIP in case status').toBe(clientDashboardPage.apiValue(caseStatus, 'WIP'));
  });

  for (const [id, tile] of [['CD_006', 'Pending Cases'], ['CD_007', 'Completed Cases'], ['CD_008', 'Submitted Cases']] as [string, TileName][]) {
    test(`${id} - ${tile} tile opens its case list with the same number of records`, async ({ page, clientDashboardPage }) => {
      const tileCount = await clientDashboardPage.tileCount(tile);
      await clientDashboardPage.openTile(tile);
      await expect(page.getByText(tile, { exact: true }).first()).toBeVisible();
      // The paginator shows "0 of 0" until the list API returns, so poll
      await expect.poll(() => clientDashboardPage.caseListTotal(), { timeout: 60_000 }).toBe(tileCount);
    });
  }
});

import * as path from 'path';
import { test, expect } from '../../fixtures/clientTest';
import { ClientBulkCaseCreationPage, BulkCandidate } from '../../pages/ClientBulkCaseCreationPage';
import clientData from '../../data/clientData.json';

/**
 * Client: Screening > Create Bulk Case Creation ("Bulk Case Creation with Document Upload").
 * NOTE: BC_009 submits and creates a real case on UAT (and the app emails an acknowledgment).
 */
const data = clientData.bulkCaseCreation;

function newCandidate(withDocument = true): BulkCandidate {
  const stamp = Date.now().toString();
  return {
    firstName: data.candidateFirstName,
    lastName: `${data.candidateLastNamePrefix}${stamp.slice(-6)}`,
    fatherName: data.fatherName,
    gender: data.gender as BulkCandidate['gender'],
    // Unique per run: an existing number triggers the "already exists" alert
    contactNumber: `9${stamp.slice(-9)}`,
    email: `autotest.bulk.${stamp.slice(-6)}@${data.emailDomain}`,
    package: data.package,
    priority: data.priority as BulkCandidate['priority'],
    documents: withDocument ? [path.resolve(data.document)] : [],
  };
}

test.describe('Client - Bulk Case Creation', () => {
  test.describe.configure({ mode: 'default', timeout: 180_000 });
  test.use({ viewport: { width: 1280, height: 800 } });

  test.beforeEach(async ({ clientLoggedIn, bulkCaseCreationPage }) => {
    void clientLoggedIn;
    await bulkCaseCreationPage.openFromMenu();
  });

  test('BC_001 - Page opens from Screening menu with default form state', async ({ bulkCaseCreationPage: bulk }) => {
    await expect(bulk.heading).toBeVisible();
    await expect(bulk.noOfCandidatesInput).toHaveValue('1');
    await expect(bulk.receivedDateInput).toBeDisabled();
    await expect(bulk.receivedDateInput).not.toHaveValue('');
    await expect(bulk.candidateListItem(1)).toBeVisible();
    await expect(bulk.prevButton).toBeDisabled();
    await expect(bulk.nextButton).toBeDisabled();
    await expect(bulk.applicantIdInput).toHaveValue('N/A');
    await expect(bulk.citizenshipSelect).toContainText('India');
    await expect(bulk.currentlyWorkingSelect).toContainText('No');
    await expect(bulk.ageInput).toBeDisabled();
  });

  test('BC_002 - Dropdowns offer the expected options', async ({ bulkCaseCreationPage: bulk }) => {
    expect(await bulk.optionsOf(bulk.genderSelect)).toEqual(data.expectedGenders);
    expect(await bulk.optionsOf(bulk.currentlyWorkingSelect)).toEqual(data.expectedCurrentlyWorking);
    expect(await bulk.optionsOf(bulk.prioritySelect)).toEqual(expect.arrayContaining(data.expectedPriorities));
    expect(await bulk.optionsOf(bulk.packageSelect)).toEqual(expect.arrayContaining(data.expectedPackages));
  });

  test('BC_003 - Choosing the top Site Name fills and locks the candidate site', async ({ bulkCaseCreationPage: bulk }) => {
    const siteName = await bulk.selectSite();
    await expect(bulk.candidateSiteSelect).toContainText(siteName);
    await expect(bulk.candidateSiteSelect).toHaveAttribute('aria-disabled', 'true');
  });

  test('BC_004 - Choosing a Package disables Individual Component', async ({ bulkCaseCreationPage: bulk }) => {
    await bulk.selectSite();
    await expect(bulk.componentSelect).toHaveAttribute('aria-disabled', 'false');
    await bulk.choose(bulk.packageSelect, data.package);
    await expect(bulk.packageSelect).toContainText(data.package);
    await expect(bulk.componentSelect).toHaveAttribute('aria-disabled', 'true');
  });

  test('BC_005 - DOB only allows adults (18+) and Age is calculated', async ({ page, bulkCaseCreationPage: bulk }) => {
    const latest = ClientBulkCaseCreationPage.latestAllowedDob();
    const tooYoung = new Date(latest);
    tooYoung.setDate(tooYoung.getDate() + 1);
    await bulk.dobCalendarButton.click();
    await expect(page.getByRole('button', { name: latest.toDateString(), exact: true })).toBeEnabled();
    if (tooYoung.getMonth() === latest.getMonth()) {
      await expect(page.getByRole('button', { name: tooYoung.toDateString(), exact: true })).toBeDisabled();
    }
    await page.getByRole('button', { name: latest.toDateString(), exact: true }).click();
    await expect(bulk.ageInput).toHaveValue('18');
  });

  test('BC_006 - Candidate is Incomplete until DOB is set; Submit does not create cases', async ({ page, bulkCaseCreationPage: bulk }) => {
    const candidate = newCandidate(false);
    await bulk.selectSite();
    await bulk.firstNameInput.fill(candidate.firstName);
    await bulk.lastNameInput.fill(candidate.lastName);
    await bulk.fatherNameInput.fill(candidate.fatherName);
    await bulk.choose(bulk.genderSelect, candidate.gender);
    await bulk.contactNumberInput.fill(candidate.contactNumber);
    await bulk.emailInput.fill(candidate.email);
    await bulk.choose(bulk.packageSelect, candidate.package);
    await bulk.choose(bulk.prioritySelect, candidate.priority);
    await expect(bulk.candidateStatus('Incomplete')).toBeVisible();

    let submitted = false;
    page.on('request', (r) => { if (r.url().includes('SaveBulkCases')) submitted = true; });
    await bulk.submitButton.click();
    await expect(bulk.successDialog).toBeHidden();
    expect(submitted, 'Submit must not send incomplete candidates').toBe(false);

    await bulk.pickAdultDob();
    await expect(bulk.candidateStatus('Complete')).toBeVisible();
  });

  test('BC_007 - An existing contact number shows the "already exists" alert', async ({ bulkCaseCreationPage: bulk }) => {
    await bulk.contactNumberInput.fill(data.existingContactNumber);
    await bulk.contactNumberInput.press('Tab');
    await expect(bulk.duplicateContactAlert).toBeVisible({ timeout: 30_000 });
    await expect(bulk.duplicateContactAlert.getByRole('button', { name: 'Proceed' })).toBeVisible();
    await bulk.duplicateContactAlert.getByRole('button', { name: 'Cancel' }).click();
    await expect(bulk.duplicateContactAlert).toBeHidden();
  });

  test('BC_008 - No. of Candidates adds candidates to the list and enables Next', async ({ bulkCaseCreationPage: bulk }) => {
    await bulk.setNoOfCandidates(2);
    await expect(bulk.candidateListItem(1)).toBeVisible();
    await expect(bulk.candidateListItem(2)).toBeVisible();
    await expect(bulk.nextButton).toBeEnabled();
    await bulk.nextButton.click();
    await expect(bulk.page.getByText('Candidate #2', { exact: true })).toBeVisible();
    await expect(bulk.prevButton).toBeEnabled();
  });

  test('BC_009 - Create one case with a document; it appears in Submitted Cases', async ({ page, bulkCaseCreationPage: bulk, clientDashboardPage }) => {
    test.setTimeout(300_000); // login + full form + submit + back to the dashboard on a slow UAT
    const candidate = newCandidate(true);
    const candidateName = `${candidate.firstName} ${candidate.lastName}`;
    // Captured when the dashboard loaded at login (before this submission)
    const submittedBefore = Number(clientDashboardPage.api.dashboardCount?.submittedCasesClient);

    await bulk.selectSite();
    await bulk.fillCandidate(candidate);
    await expect(bulk.candidateStatus('Complete')).toBeVisible();
    await expect(bulk.uploadedFile(path.basename(data.document))).toBeVisible();

    const results = await bulk.submit();
    expect(results).toHaveLength(1);
    expect(results[0].candidate).toBe(candidateName);
    expect(results[0].package).toBe(candidate.package);
    expect(results[0].priority).toBe(candidate.priority);
    expect(results[0].reference).toMatch(new RegExp(data.caseReferencePattern));
    console.log(`Created case ${results[0].reference} for ${candidateName}`);
    await bulk.closeSuccessDialog();

    // New bulk cases land in Submitted Cases (status "Submitted"), not Pending
    await page.goto('/dashboard/home', { waitUntil: 'domcontentloaded' });
    await clientDashboardPage.waitForLoaded();
    expect(await clientDashboardPage.tileCount('Submitted Cases')).toBe(submittedBefore + 1);
    await clientDashboardPage.openTile('Submitted Cases');
    await clientDashboardPage.searchCases(candidate.lastName);
    const row = page.getByRole('row').filter({ hasText: results[0].reference });
    await expect(row).toBeVisible({ timeout: 30_000 });
    await expect(row).toContainText(candidateName);
    await expect(row).toContainText('Submitted');
  });
});

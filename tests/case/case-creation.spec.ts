import { test, expect } from '../../fixtures/kryaTest';
import authData from '../../data/authData';
import caseData from '../../data/caseData.json';

// Requires a saved Krya session: npm run auth:krya
// NOTE: TC_CC_004 creates a real case on UAT and sends the case-creation mail.

const data = caseData.caseCreation;

test.describe('Krya Internal - Case Creation', () => {
  // The Case Initiation date-time picker's "Set" button is cut off in short viewports
  test.use({ viewport: { width: 1280, height: 800 } });
  // UAT is slow and each test walks department -> dashboard -> case creation
  test.describe.configure({ timeout: 120_000 });

  test.beforeEach(async ({ departmentPage, caseCreationPage }) => {
    await departmentPage.goto();
    await departmentPage.chooseDepartment(authData.kryaLogin.department);
    await caseCreationPage.openFromDashboard();
  });

  test('TC_CC_001 - Case Creation list opens from dashboard tile', async ({ page, caseCreationPage }) => {
    await expect(page).toHaveURL(/dashboard\/case\/case-creation/);
    await expect(caseCreationPage.addButton).toBeVisible();
    await expect(caseCreationPage.searchInput).toBeVisible();
  });

  test('TC_CC_002 - Add form shows fields, with Site disabled until a client is chosen', async ({ caseCreationPage }) => {
    await caseCreationPage.clickAdd();
    await expect(caseCreationPage.clientNameInput).toBeEditable();
    await expect(caseCreationPage.siteNameInput).toBeDisabled();
    await expect(caseCreationPage.documentFolderPathInput).toBeVisible();
    await expect(caseCreationPage.receivedDateInput).not.toHaveValue('');
    await expect(caseCreationPage.caseInitiationDateInput).toHaveValue('');
    await expect(caseCreationPage.autoAssignCheckbox).toBeChecked();
  });

  test('TC_CC_003 - Client search suggests matching clients', async ({ caseCreationPage }) => {
    await caseCreationPage.clickAdd();
    const clients = await caseCreationPage.searchClient(data.clientSearchText);
    expect(clients).toContain(data.clientName);
    for (const client of clients) {
      expect(client.toLowerCase()).toContain(data.clientSearchText.toLowerCase());
    }
  });

  test('TC_CC_004 - Create a case for one candidate and send the case-creation mail', async ({ caseCreationPage }) => {
    const lastName = `${data.candidateLastNamePrefix}${Date.now().toString().slice(-6)}`;
    const candidateName = `${data.candidateFirstName} ${lastName}`;

    await caseCreationPage.clickAdd();
    await caseCreationPage.selectClient(data.clientName);
    await caseCreationPage.selectSite(data.siteName);
    await caseCreationPage.setNoOfCandidates(data.noOfCandidates);
    await caseCreationPage.documentFolderPathInput.fill(data.documentFolderPath);
    await caseCreationPage.setCaseInitiationDateToday();
    await caseCreationPage.fillCandidate(0, { firstName: data.candidateFirstName, lastName });

    const caseRefs = await caseCreationPage.save();
    expect(caseRefs).toHaveLength(1);
    const caseRef = caseRefs[0];
    console.log(`Created case ${caseRef} for ${candidateName}`);

    await caseCreationPage.addMailTo(data.mailTo);
    await caseCreationPage.sendMail();

    const row = caseCreationPage.caseRow(caseRef);
    await expect(row).toBeVisible();
    await expect(row).toContainText(candidateName);
    await expect(row).toContainText(data.clientName);
    await expect(row).toContainText(data.siteDisplayName);
  });
});

import { Page, Locator, expect } from '@playwright/test';

export type BulkCandidate = {
  firstName: string;
  lastName: string;
  fatherName: string;
  gender: 'Male' | 'Female' | 'Not Provided / Not Applicable';
  contactNumber: string;
  email: string;
  package: string;
  priority: 'Standard' | 'High';
  /** Optional document(s) to upload for the candidate */
  documents?: string[];
};

/** Client: Screening > Create Bulk Case Creation ("Bulk Case Creation with Document Upload"). */
export class ClientBulkCaseCreationPage {
  readonly page: Page;
  readonly url = '/dashboard/screening/clientcreatebulkcase';

  readonly heading: Locator;
  readonly siteNameInput: Locator;
  readonly noOfCandidatesInput: Locator;
  readonly receivedDateInput: Locator;
  readonly saveDraftButton: Locator;
  readonly submitButton: Locator;
  readonly candidateSearch: Locator;
  readonly prevButton: Locator;
  readonly nextButton: Locator;
  readonly loadingSpinner: Locator;

  // Candidate form (the currently selected candidate)
  readonly applicantIdInput: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly fatherNameInput: Locator;
  readonly genderSelect: Locator;
  readonly dobInput: Locator;
  readonly dobCalendarButton: Locator;
  readonly citizenshipSelect: Locator;
  readonly ageInput: Locator;
  readonly contactNumberInput: Locator;
  readonly emailInput: Locator;
  readonly currentlyWorkingSelect: Locator;
  readonly candidateSiteSelect: Locator;
  readonly packageSelect: Locator;
  readonly componentSelect: Locator;
  readonly prioritySelect: Locator;
  readonly fileInput: Locator;

  // Dialogs
  readonly duplicateContactAlert: Locator;
  readonly successDialog: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Bulk Case Creation with Document Upload' });
    this.siteNameInput = page.getByRole('combobox', { name: 'Site Name' });
    this.noOfCandidatesInput = page.getByRole('textbox', { name: 'No. of Candidates' });
    this.receivedDateInput = page.getByRole('textbox', { name: 'Received Date & Time' });
    this.saveDraftButton = page.getByRole('button', { name: 'Save', exact: true });
    this.submitButton = page.getByRole('button', { name: /submit/i });
    this.candidateSearch = page.getByRole('textbox', { name: 'Search candidates...' });
    this.prevButton = page.getByRole('button', { name: 'Prev' });
    this.nextButton = page.getByRole('button', { name: 'Next' });
    this.loadingSpinner = page.locator('ngx-spinner .overlay');

    this.applicantIdInput = page.getByRole('textbox', { name: 'Applicant ID' });
    this.firstNameInput = page.getByRole('textbox', { name: 'First Name' });
    this.lastNameInput = page.getByRole('textbox', { name: 'Last Name' });
    this.fatherNameInput = page.getByRole('textbox', { name: 'Father Name' });
    this.genderSelect = page.getByRole('listbox', { name: 'Select', exact: true }); // Gender's mat-select is labelled "Select"
    this.dobInput = page.getByRole('textbox', { name: 'DOB' });
    this.dobCalendarButton = page.getByRole('button', { name: 'Open calendar' }).last();
    this.citizenshipSelect = page.getByRole('listbox', { name: 'Citizenship', exact: true });
    this.ageInput = page.getByRole('textbox', { name: 'Age' });
    this.contactNumberInput = page.getByRole('textbox', { name: 'Contact Number' });
    this.emailInput = page.getByRole('textbox', { name: 'Email ID' });
    this.currentlyWorkingSelect = page.getByRole('listbox', { name: 'Currently Working', exact: true });
    this.candidateSiteSelect = page.getByRole('listbox', { name: 'Select Site Name', exact: true });
    this.packageSelect = page.getByRole('listbox', { name: 'Package', exact: true });
    this.componentSelect = page.getByRole('listbox', { name: 'Select Component', exact: true });
    this.prioritySelect = page.getByRole('listbox', { name: 'Priority', exact: true });
    this.fileInput = page.locator('input[type="file"]');

    this.duplicateContactAlert = page.getByRole('dialog').filter({ hasText: 'This Contact Number already exists' });
    this.successDialog = page.getByRole('dialog').filter({ hasText: 'Cases Created Successfully' });
  }

  async goto() {
    await this.page.goto(this.url, { waitUntil: 'domcontentloaded' });
    await this.waitForLoaded();
  }

  /** Opens the page the way a user does: sidebar Screening > Create Bulk Case Creation. */
  async openFromMenu() {
    await this.page.getByText('Screening', { exact: true }).first().click();
    await this.page.getByText('Create Bulk Case Creation', { exact: true }).click();
    await this.waitForLoaded();
  }

  async waitForLoaded() {
    await expect(this.page).toHaveURL(/clientcreatebulkcase/, { timeout: 60_000 });
    await expect(this.heading).toBeVisible({ timeout: 60_000 });
    await expect(this.firstNameInput).toBeVisible({ timeout: 60_000 });
    await this.waitForSpinner();
  }

  /** The app shows a full-screen spinner during API calls; it swallows clicks while visible. */
  async waitForSpinner() {
    await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 60_000 }).catch(() => {});
  }

  /** Entry in the left candidate list, e.g. "#1 AutoTest Bulk123 Complete". */
  candidateListItem(index: number) {
    return this.page.getByText(new RegExp(`^#${index}\\b`)).first();
  }

  /** An uploaded file's name in the Document Upload area (its tooltip repeats the name, so match the label). */
  uploadedFile(fileName: string) {
    return this.page.locator('.file-name').filter({ hasText: fileName });
  }

  candidateStatus(status: 'Complete' | 'Incomplete') {
    return this.page.getByText(status, { exact: true });
  }

  /** Opens a mat-select and returns its option texts (trimmed), then closes it. */
  async optionsOf(select: Locator) {
    await this.openSelect(select);
    const options = (await this.page.getByRole('option').allInnerTexts()).map((o) => o.trim());
    await this.page.keyboard.press('Escape');
    await expect(this.page.getByRole('option')).toHaveCount(0);
    return options;
  }

  private async openSelect(select: Locator) {
    await this.waitForSpinner();
    await select.click();
    // The first click is sometimes swallowed right after an API call — retry once
    if (!(await this.page.getByRole('option').first().isVisible({ timeout: 2_000 }).catch(() => false))) {
      await this.waitForSpinner();
      await select.click();
    }
    await expect(this.page.getByRole('option').first()).toBeVisible();
  }

  async choose(select: Locator, option: string) {
    await this.openSelect(select);
    await this.page.getByRole('option').filter({ hasText: option }).first().click();
    await this.waitForSpinner();
  }

  async selectSite(index = 0) {
    await this.siteNameInput.click();
    const option = this.page.getByRole('option').nth(index);
    const siteName = (await option.innerText()).trim();
    await option.click();
    await this.waitForSpinner();
    return siteName;
  }

  async setNoOfCandidates(count: number) {
    await this.noOfCandidatesInput.fill(String(count));
    await this.noOfCandidatesInput.press('Tab');
    await this.waitForSpinner();
  }

  /** Latest selectable DOB: the calendar only allows candidates aged 18+. */
  static latestAllowedDob(today = new Date()) {
    return new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  }

  /** Picks the 1st of the month 18 years ago (the calendar opens on that month). */
  async pickAdultDob(today = new Date()) {
    const dob = new Date(today.getFullYear() - 18, today.getMonth(), 1);
    await this.dobCalendarButton.click();
    await this.page.getByRole('button', { name: dob.toDateString(), exact: true }).click();
    await expect(this.dobInput).not.toHaveValue('');
    return dob;
  }

  async fillCandidate(candidate: BulkCandidate) {
    await this.firstNameInput.fill(candidate.firstName);
    await this.lastNameInput.fill(candidate.lastName);
    await this.fatherNameInput.fill(candidate.fatherName);
    await this.choose(this.genderSelect, candidate.gender);
    await this.pickAdultDob();
    await this.contactNumberInput.fill(candidate.contactNumber);
    await this.emailInput.fill(candidate.email);
    await this.emailInput.press('Tab');
    await this.waitForSpinner();
    await this.choose(this.packageSelect, candidate.package);
    await this.choose(this.prioritySelect, candidate.priority);
    if (candidate.documents?.length) {
      await this.fileInput.setInputFiles(candidate.documents);
      await this.waitForSpinner();
    }
  }

  /** Submits and returns the rows of the "Cases Created Successfully" dialog. */
  async submit() {
    await this.submitButton.click();
    await expect(this.successDialog).toBeVisible({ timeout: 60_000 });
    const rows = this.successDialog.getByRole('row').filter({ hasNot: this.page.getByRole('columnheader') });
    const results: { candidate: string; priority: string; package: string; reference: string }[] = [];
    for (let i = 0; i < (await rows.count()); i++) {
      const cells = (await rows.nth(i).getByRole('cell').allInnerTexts()).map((c) => c.trim());
      results.push({ candidate: cells[1], priority: cells[2], package: cells[3], reference: cells[4] });
    }
    return results;
  }

  async closeSuccessDialog() {
    await this.successDialog.getByRole('button', { name: 'Close' }).click();
    await expect(this.successDialog).toBeHidden();
  }
}

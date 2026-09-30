import { Page, Locator, expect } from '@playwright/test';

export type CandidateDetails = {
  employeeId?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
};

/** Screening > Clients Case Creation (/dashboard/case/case-creation): case list, Add form and mail dialog. */
export class CaseCreationPage {
  readonly page: Page;

  // Dashboard
  readonly dashboardCaseCreationTile: Locator;

  // Case list
  readonly listHeading: Locator;
  readonly addButton: Locator;
  readonly searchInput: Locator;

  // Add form
  readonly clientNameInput: Locator;
  readonly siteNameInput: Locator;
  readonly noOfCandidatesInput: Locator;
  readonly documentFolderPathInput: Locator;
  readonly receivedDateInput: Locator;
  readonly caseInitiationDateInput: Locator;
  readonly caseInitiationCalendarButton: Locator;
  readonly companySiteVisitCheckbox: Locator;
  readonly autoAssignCheckbox: Locator;
  readonly saveButton: Locator;
  readonly options: Locator;

  // Date-time picker
  readonly pickerSetButton: Locator;

  // Mail dialog shown after save
  readonly mailDialog: Locator;
  readonly mailToInput: Locator;
  readonly sendMailButton: Locator;

  // Toast messages
  readonly savedSuccessMessage: Locator;
  readonly mailSentMessage: Locator;
  readonly addMailIdMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    this.dashboardCaseCreationTile = page.getByText('Case Creation', { exact: true });

    this.listHeading = page.getByRole('heading', { name: 'Case Creation', level: 1 });
    this.addButton = page.getByRole('button', { name: /add$/i });
    this.searchInput = page.getByPlaceholder('Search here...');

    this.clientNameInput = page.getByRole('combobox', { name: 'Client Name' });
    this.siteNameInput = page.getByRole('combobox', { name: 'Site Name' });
    this.noOfCandidatesInput = page.getByRole('textbox', { name: 'No. of Candidates' });
    this.documentFolderPathInput = page.getByRole('textbox', { name: 'Document Folder path' });
    this.receivedDateInput = page.getByRole('textbox', { name: 'Received Date & Time' });
    this.caseInitiationDateInput = page.getByRole('textbox', { name: 'Case Initiation Date' });
    this.caseInitiationCalendarButton = page
      .locator('mat-form-field')
      .filter({ hasText: 'Case Initiation Date' })
      .getByRole('button', { name: 'Open calendar' });
    this.companySiteVisitCheckbox = page.getByRole('checkbox', { name: 'Company Site Visit' });
    this.autoAssignCheckbox = page.getByRole('checkbox', { name: 'Auto assign to scope team members' });
    this.saveButton = page.getByRole('button', { name: /save$/i });
    this.options = page.getByRole('option');

    this.pickerSetButton = page.getByRole('button', { name: 'Set', exact: true });

    this.mailDialog = page.getByRole('dialog').filter({ hasText: 'Case Creation Mail List' });
    this.mailToInput = this.mailDialog.getByRole('textbox', { name: 'To' });
    this.sendMailButton = this.mailDialog.getByRole('button', { name: 'Send Mail' });

    this.savedSuccessMessage = page.getByText('Saved Successfully');
    this.mailSentMessage = page.getByText('Mail send Successfully');
    this.addMailIdMessage = page.getByText('Please add MailId');
  }

  /** From the dashboard, opens the Case Creation list via its count tile. */
  async openFromDashboard() {
    await this.dashboardCaseCreationTile.click();
    await this.page.waitForURL(/case\/case-creation/);
    await expect(this.listHeading).toBeVisible();
  }

  async clickAdd() {
    await this.addButton.click();
    await expect(this.clientNameInput).toBeVisible();
  }

  /** Types into the client autocomplete and returns the suggested client names. */
  async searchClient(text: string) {
    await this.clientNameInput.fill(text);
    await expect(this.options.first()).toBeVisible();
    return this.options.allInnerTexts();
  }

  async selectClient(clientName: string) {
    await this.searchClient(clientName.split(' ')[0]);
    await this.page.getByRole('option', { name: clientName, exact: true }).click();
    await expect(this.siteNameInput).toBeEnabled();
  }

  async selectSite(siteName: string) {
    await this.siteNameInput.click();
    await this.page.getByRole('option', { name: siteName, exact: true }).click();
  }

  async setNoOfCandidates(count: number) {
    await this.noOfCandidatesInput.fill(String(count));
    await this.noOfCandidatesInput.press('Tab');
    await expect(this.page.getByRole('textbox', { name: 'First Name' })).toHaveCount(count);
  }

  /** Picks today's date in the Case Initiation date-time picker, keeping the default (current) time. */
  async setCaseInitiationDateToday() {
    await this.caseInitiationCalendarButton.click();
    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    await this.page.getByRole('cell', { name: today, exact: true }).click();
    await this.pickerSetButton.click();
    await expect(this.caseInitiationDateInput).not.toHaveValue('');
  }

  /** Fills the candidate row at the given 0-based index. */
  async fillCandidate(index: number, candidate: CandidateDetails) {
    if (candidate.employeeId !== undefined) {
      await this.page.getByRole('textbox', { name: 'Employee ID' }).nth(index).fill(candidate.employeeId);
    }
    await this.page.getByRole('textbox', { name: 'First Name' }).nth(index).fill(candidate.firstName);
    if (candidate.middleName !== undefined) {
      await this.page.getByRole('textbox', { name: 'Middle Name' }).nth(index).fill(candidate.middleName);
    }
    await this.page.getByRole('textbox', { name: 'Last Name' }).nth(index).fill(candidate.lastName);
  }

  /** Saves the case and returns the Client Reference No(s) shown in the mail dialog, e.g. "KSPL-KSL-290". */
  async save() {
    await this.saveButton.click();
    await expect(this.savedSuccessMessage).toBeVisible();
    await expect(this.mailDialog).toBeVisible();
    const caseRefCells = this.mailDialog.getByRole('cell', { name: /^[A-Z]+-[A-Z]+-\d+$/ });
    await expect(caseRefCells.first()).toBeVisible(); // table rows render after the dialog opens
    return caseRefCells.allInnerTexts();
  }

  async addMailTo(email: string) {
    await this.mailToInput.fill(email);
    await this.mailToInput.press('Enter');
    await expect(this.mailDialog.getByRole('option', { name: email })).toBeVisible();
  }

  async sendMail() {
    await this.sendMailButton.click();
    await expect(this.mailSentMessage).toBeVisible();
    await expect(this.mailDialog).toBeHidden();
  }

  /** The case list row containing the given text (candidate name or case ref). */
  caseRow(text: string) {
    return this.page.getByRole('row').filter({ hasText: text });
  }
}

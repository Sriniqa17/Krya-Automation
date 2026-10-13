import { Page, Locator, expect } from '@playwright/test';
import { BaseLoginPage } from './BaseLoginPage';

/**
 * Client (Business Partner) login. Reached from the landing page's "Client Login" card;
 * it uses the same /login URL as Krya login but shows a "CLIENT LOGIN" tab.
 */
export class ClientLoginPage extends BaseLoginPage {
  readonly clientLoginTab: Locator;
  readonly loginHeading: Locator;

  // Messages
  readonly captchaInvalidError: Locator;
  readonly invalidCredentialsMessage: Locator;

  // Forgot Password dialog
  readonly forgotPasswordDialog: Locator;
  readonly forgotUsernameInput: Locator;
  readonly forgotCaptchaInput: Locator;
  readonly forgotSubmitButton: Locator;
  readonly forgotCancelButton: Locator;
  readonly forgotUnknownUserMessage: Locator;

  constructor(page: Page) {
    super(page);
    // The tab's <h5 class="logName"> is styled so Playwright reports it hidden, so check its text, not visibility
    this.clientLoginTab = page.locator('h5.logName');
    this.loginHeading = page.getByRole('heading', { name: 'Login to Verification Tracking System' });

    this.captchaInvalidError = page.getByText('Captcha invalid');
    this.invalidCredentialsMessage = page.getByText('Invalid Credentials');

    this.forgotPasswordDialog = page.getByRole('dialog').filter({ hasText: 'Forgot Password' });
    this.forgotUsernameInput = this.forgotPasswordDialog.getByRole('textbox', { name: /user ?name|email/i });
    this.forgotCaptchaInput = this.forgotPasswordDialog.getByRole('textbox', { name: /captcha/i });
    this.forgotSubmitButton = this.forgotPasswordDialog.getByRole('button', { name: 'Submit' });
    this.forgotCancelButton = this.forgotPasswordDialog.getByRole('button', { name: 'Cancel' });
    this.forgotUnknownUserMessage = page.getByText('UserName / Email Address not exists');
  }

  async verifyClientLoginPageLoaded() {
    await expect(this.clientLoginTab).toHaveText('CLIENT LOGIN', { timeout: 30_000 });
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
    await this.waitForCaptchaLoaded();
  }

  async openForgotPassword() {
    await this.forgotPasswordLink.click();
    await expect(this.forgotPasswordDialog).toBeVisible();
  }
}

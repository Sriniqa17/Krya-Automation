import { Page, Locator, expect } from '@playwright/test';

export class BaseLoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly forgotPasswordLink: Locator;
  readonly pageHeading: Locator;
  readonly captchaContainer: Locator;
  readonly captchaInput: Locator;
  readonly continueSessionButton: Locator;
  readonly captchaRefreshButton: Locator;
  readonly passwordVisibilityToggle: Locator;

  /** Captcha image (base64) -> answer, as returned by the GetCaptcha API. */
  private readonly captchaAnswers = new Map<string, string>();

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByRole('textbox', { name: /username|email/i });
    // Matched by label so it still works after the eye icon switches type="password" -> "text"
    this.passwordInput = page.getByRole('textbox', { name: 'Password', exact: true });
    this.loginButton = page.getByRole('button', { name: /sign in|login/i });
    this.errorMessage = page.locator('.error, .alert-danger, [role="alert"], .invalid-feedback, .error-message').first();
    this.forgotPasswordLink = page.getByText('Forgot password?', { exact: true });
    this.pageHeading = page.getByRole('heading').first();
    this.captchaContainer = page.getByRole('img', { name: /captcha/i });
    this.captchaInput = page.getByRole('textbox', { name: /captcha/i });
    this.captchaRefreshButton = page.locator('button[mattooltip="Refresh"]').first();
    // Eye icon: aria-label toggles between "Hide password" and "Show password"
    this.passwordVisibilityToggle = page.locator('mat-icon[aria-label$="password"]');
    // "Are you sure, do you want to continue this user account?" — shown when the user is already logged in elsewhere
    this.continueSessionButton = page.getByRole('button', { name: /yes, continue/i });

    // UAT-only shortcut: the GetCaptcha API returns the answer ("captchaCode") next to the image
    // ("captchaDoc"). This is a VTS security bug — once it is fixed, replace fillCaptchaFromApi()
    // with a proper UAT captcha bypass.
    page.on('response', async (response) => {
      if (!response.url().includes('/Captch/GetCaptcha')) return;
      try {
        const { captchaCode, captchaDoc } = await response.json();
        if (captchaCode && captchaDoc) this.captchaAnswers.set(captchaDoc, captchaCode);
      } catch {
        // response body unavailable (e.g. page navigated away)
      }
    });
  }

  /** Answer for the captcha currently shown in `image` (matched by its image data). */
  async currentCaptchaAnswer(image: Locator = this.captchaContainer): Promise<string> {
    let answer: string | undefined;
    await expect
      .poll(async () => {
        const src = (await image.getAttribute('src')) ?? '';
        const imageData = src.slice(src.indexOf(',') + 1);
        answer = this.captchaAnswers.get(imageData);
        return answer;
      }, { message: 'Captcha answer not captured from the GetCaptcha API', timeout: 60_000 })
      .toBeTruthy();
    return answer!;
  }

  /** Waits until the captcha image has actually loaded (UAT can take 10+ seconds). */
  async waitForCaptchaLoaded(image: Locator = this.captchaContainer) {
    await expect(image).toHaveAttribute('src', /^data:image/, { timeout: 60_000 });
  }

  async fillCaptchaFromApi() {
    await this.captchaInput.fill(await this.currentCaptchaAnswer());
  }

  /** Full login: credentials + captcha + Sign In, accepting the "continue this account?" dialog if shown. */
  async loginWithCaptcha(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.fillCaptchaFromApi();
    await this.loginButton.click();
    await this.confirmSessionTakeoverIfPrompted();
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /** Accepts the "already logged in elsewhere" dialog if it appears, closing the other session. */
  async confirmSessionTakeoverIfPrompted(timeout = 5000) {
    await this.continueSessionButton
      .click({ timeout })
      .catch(() => {}); // dialog not shown
  }

  async verifyErrorVisible() {
    await expect(this.errorMessage).toBeVisible();
  }

  async verifyForgotPasswordLink() {
    await expect(this.forgotPasswordLink).toBeVisible();
  }

  async clearFields() {
    await this.usernameInput.clear();
    await this.passwordInput.clear();
  }

  async isLoginButtonEnabled() {
    return !(await this.loginButton.isDisabled().catch(() => false));
  }
}

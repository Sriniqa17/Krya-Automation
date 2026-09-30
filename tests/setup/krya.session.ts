import * as fs from 'fs';
import { test } from '../../fixtures/baseTest';
import authData from '../../data/authData';
import { KRYA_SESSION_STORAGE } from '../../fixtures/kryaTest';

const CAPTCHA_IMAGE = 'playwright/.auth/captcha.png';
const CAPTCHA_ANSWER = 'playwright/.auth/captcha.txt';

// Krya login requires a captcha. This saves the captcha image to CAPTCHA_IMAGE and waits
// for its text in CAPTCHA_ANSWER. Logging in manually in the browser window also works.
// Run once (or whenever the session expires): npm run auth:krya
test('Save Krya internal session', async ({ page, landingPage, kryaLoginPage }) => {
  test.skip(!process.env.SAVE_SESSION, 'Run via npm run auth:krya');
  test.setTimeout(10 * 60 * 1000);

  // Still on the login page, or bounced back to the landing page
  const isLoggedOut = (url: URL) => url.pathname === '/' || /login/i.test(url.pathname);
  const onLoginPage = () => isLoggedOut(new URL(page.url()));

  await landingPage.goto();
  await landingPage.clickKryaLogin();
  await kryaLoginPage.verifyKryaLoginPageLoaded();

  for (let attempt = 1; onLoginPage(); attempt++) {
    if (attempt > 3) throw new Error('Login failed after 3 captcha attempts');

    fs.rmSync(CAPTCHA_ANSWER, { force: true });
    await kryaLoginPage.usernameInput.fill(authData.kryaLogin.username);
    await kryaLoginPage.passwordInput.fill(authData.kryaLogin.password);
    await kryaLoginPage.captchaContainer.screenshot({ path: CAPTCHA_IMAGE });
    console.log(`>>> Attempt ${attempt}: type the captcha and click Sign In in the browser window`);
    console.log(`    (or write the captcha text to ${CAPTCHA_ANSWER}; image saved to ${CAPTCHA_IMAGE})`);

    const deadline = Date.now() + 5 * 60 * 1000;
    while (!fs.existsSync(CAPTCHA_ANSWER) && onLoginPage()) {
      if (Date.now() > deadline) throw new Error('Timed out after 5 minutes waiting for login');
      // Manual sign-in can raise the "continue this user account?" dialog — accept it
      if (await kryaLoginPage.continueSessionButton.isVisible()) {
        await kryaLoginPage.continueSessionButton.click();
      }
      await page.waitForTimeout(1000);
    }
    if (!onLoginPage()) break; // logged in manually

    await kryaLoginPage.captchaInput.fill(fs.readFileSync(CAPTCHA_ANSWER, 'utf-8').trim());
    console.log('>>> Captcha filled, clicking Sign In');
    await kryaLoginPage.loginButton.click({ timeout: 10000 });
    await kryaLoginPage.confirmSessionTakeoverIfPrompted();
    console.log(`>>> Clicked Sign In, now on ${page.url()}`);
    await page.waitForURL((url) => !isLoggedOut(url), { timeout: 15000 }).catch(async () => {
      await page.screenshot({ path: 'playwright/.auth/login-failed.png', timeout: 5000 }).catch(() => {});
      console.log('>>> Login did not succeed, retrying with a new captcha');
    });
  }

  // The app keeps polling after login, so 'networkidle' never settles
  console.log(`>>> Logged in, landed on ${page.url()}`);
  await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(3000);
  fs.rmSync(CAPTCHA_ANSWER, { force: true });

  // Department is chosen per test (DepartmentPage), so the session stops at /deptChoose.
  // Auth lives in sessionStorage, which storageState() does not capture
  const sessionData = await page.evaluate(() => JSON.stringify(sessionStorage));
  fs.writeFileSync(KRYA_SESSION_STORAGE, sessionData);
  console.log(`>>> Session saved to ${KRYA_SESSION_STORAGE}`);
  console.log(`>>> sessionStorage keys: ${Object.keys(JSON.parse(sessionData)).join(', ')}`);
  await page.screenshot({ path: 'playwright/.auth/after-login.png', timeout: 10000 }).catch(() => {});
});

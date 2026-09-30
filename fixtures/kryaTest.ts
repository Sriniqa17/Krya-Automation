import * as fs from 'fs';
import { test as base } from './baseTest';

export const KRYA_SESSION_STORAGE = 'playwright/.auth/krya-session-storage.json';

/**
 * Test pre-authenticated as the Krya internal user.
 * VTS keeps its auth in sessionStorage, which Playwright's storageState does not persist,
 * so it is restored with an init script before any page script runs.
 * (localStorage is deliberately not restored: its "tabOpen" flag makes the app blank the page.)
 * Create/refresh the session with: npm run auth:krya
 */
export const test = base.extend({
  context: async ({ context, baseURL }, use) => {
    if (!fs.existsSync(KRYA_SESSION_STORAGE)) {
      throw new Error(`No Krya session found at ${KRYA_SESSION_STORAGE}. Run: npm run auth:krya`);
    }
    const sessionData = fs.readFileSync(KRYA_SESSION_STORAGE, 'utf-8');
    await context.addInitScript(
      ({ data, origin }) => {
        if (window.location.origin !== origin) return;
        for (const [key, value] of Object.entries(JSON.parse(data) as Record<string, string>)) {
          window.sessionStorage.setItem(key, value);
        }
      },
      { data: sessionData, origin: new URL(baseURL!).origin }
    );
    await use(context);
  },
});

export { expect } from '@playwright/test';

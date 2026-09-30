import { defineConfig, devices } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Local secrets (passwords) — see .env.example. In CI they come from repository secrets.
if (fs.existsSync(path.resolve(__dirname, '.env'))) {
  process.loadEnvFile(path.resolve(__dirname, '.env'));
}

const env = process.env.ENV || 'qa';
const envConfig = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, `config/${env}.json`), 'utf-8')
);

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [['html', { open: 'never' }], ['list']],

  // Visual regression (toHaveScreenshot) defaults
  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.01, // tolerate up to 1% of pixels differing (anti-aliasing noise)
    },
  },

  use: {
    baseURL: envConfig.baseUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      // Manual one-time login (captcha). Run: npm run auth:krya
      name: 'krya-session',
      testMatch: /.*\.session\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        headless: false,
      },
    },
    {
      name: 'Google Chrome',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        headless: true,
      },
    },
  ],
});

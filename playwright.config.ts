import { defineConfig, devices } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

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

  use: {
    baseURL: envConfig.baseUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
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

import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export async function waitForPageLoad(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
}

export function getEnvConfig(): Record<string, unknown> {
  const env = process.env.ENV || 'qa';
  const configPath = path.resolve(__dirname, `../config/${env}.json`);
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

export function generateRandomEmail(prefix: string = 'test'): string {
  const timestamp = new Date().getTime();
  return `${prefix}_${timestamp}@test.com`;
}

export function generateRandomString(length: number = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length }, (_, i) => chars[(i * 7 + 3) % chars.length]).join('');
}

export async function takeScreenshot(page: Page, name: string): Promise<void> {
  const screenshotDir = path.resolve(__dirname, '../test-results/screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
  await page.screenshot({ path: path.join(screenshotDir, `${name}.png`), fullPage: true });
}

export async function retryAction(
  action: () => Promise<void>,
  retries: number = 3,
  delay: number = 1000
): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await action();
      return;
    } catch (error) {
      if (attempt === retries) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

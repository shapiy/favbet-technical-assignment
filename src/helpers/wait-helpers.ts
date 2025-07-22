import { Page } from '@playwright/test';

export class WaitHelpers {
  static async waitForElement(page: Page, selector: string, timeout = 30000) {
    await page.locator(selector).waitFor({ state: 'visible', timeout });
  }

  static async waitForElementToDisappear(page: Page, selector: string, timeout = 30000) {
    await page.locator(selector).waitFor({ state: 'hidden', timeout });
  }

  static async waitForText(page: Page, text: string, timeout = 30000) {
    await page.locator(`text=${text}`).waitFor({ state: 'visible', timeout });
  }

  static async waitForURL(page: Page, urlPattern: string | RegExp, timeout = 30000) {
    await page.waitForURL(urlPattern, { timeout });
  }

  static async waitForAPIResponse(page: Page, urlPattern: string | RegExp, timeout = 30000) {
    await page.waitForResponse(urlPattern, { timeout });
  }

  static async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async waitForAnimation(page: Page) {
    await page.waitForTimeout(500);
  }
}

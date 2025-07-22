import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  readonly mainHeading: Locator;
  readonly moreInfoLink: Locator;
  readonly paragraphText: Locator;

  constructor(page: Page) {
    super(page);
    this.mainHeading = page.locator('h1');
    this.moreInfoLink = page.locator('a', { hasText: 'More information...' });
    this.paragraphText = page.locator('p');
  }

  async goto() {
    await this.page.goto('https://example.com');
    await this.waitForPageLoad();
  }

  async clickMoreInformation() {
    await this.moreInfoLink.click();
  }

  async getMainHeadingText(): Promise<string> {
    return await this.mainHeading.textContent() || '';
  }

  async getParagraphText(): Promise<string> {
    return await this.paragraphText.textContent() || '';
  }
}
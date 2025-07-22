import { test, expect } from '@playwright/test';
import { AuthHelper } from '../../src/helpers/auth-helper';
import { testData } from '../../src/utils/test-data';

test.describe('YouTube Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Favbet homepage
    await page.goto(testData.favbet.urls.homepage);

    // Ensure user is logged in
    await AuthHelper.ensureLoggedIn(page);
  });

  test('should navigate to YouTube and verify channel and specific video', async ({ page }) => {
    let youtubeTab: any;

    // Test steps according to assignment:
    // 1. login to favbet.ua (done in beforeEach)

    // 2. Navigate to Youtube social network
    await test.step('Navigate to YouTube social network', async () => {
      // Scroll to footer to find social media links
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

      // Find and click the YouTube link in the footer social media section
      const youtubeLink = page.locator('a[href="https://www.youtube.com/@favbetua"]');
      await expect(youtubeLink).toBeVisible({ timeout: testData.timeouts.medium });

      // Click the YouTube link - this will open in a new tab
      const [newTab] = await Promise.all([page.waitForEvent('popup'), youtubeLink.click()]);

      youtubeTab = newTab;
      await youtubeTab.waitForLoadState('domcontentloaded');
    });

    // 3. Check accurate channel is opened
    await test.step('Verify correct Favbet YouTube channel is opened', async () => {
      // Verify we're on the correct YouTube channel page
      await expect(youtubeTab).toHaveURL(/youtube\.com\/@favbetua/);
      await expect(youtubeTab).toHaveTitle(/Favbet UA - YouTube/);

      // Verify channel name and handle
      const channelName = youtubeTab.locator('h1:has-text("Favbet UA")');
      await expect(channelName).toBeVisible({ timeout: testData.timeouts.medium });

      const channelHandle = youtubeTab.locator('text=@favbetua');
      await expect(channelHandle).toBeVisible({ timeout: testData.timeouts.medium });

      // Verify it's the official Favbet channel
      const channelDescription = youtubeTab
        .locator('text=Офіційний ютуб-канал компанії Favbet')
        .first();
      await expect(channelDescription).toBeVisible({ timeout: testData.timeouts.medium });
    });

    // 4. Check video 'FAVBET | Support Those Who Support Us: ENGLAND | 2022 FIFA World Cup' is present
    await test.step('Check for specific video', async () => {
      // Use search to find the specific video
      const searchBox = youtubeTab.getByRole('combobox', { placeholder: 'Search' });
      await searchBox.fill(testData.favbet.youtube.targetVideo);

      const searchButton = youtubeTab.getByRole('button', { name: 'Search' });
      await searchButton.click();

      await youtubeTab.waitForLoadState('domcontentloaded');

      // Look for the video in search results
      const englandVideo = youtubeTab.locator(
        'a:has-text("FAVBET | Support Those Who Support Us: ENGLAND")'
      );
      await expect(englandVideo.first()).toBeVisible({ timeout: testData.timeouts.medium });
    });
  });

  test.afterEach(async ({ page }, testInfo) => {
    // Take screenshot on failure
    if (testInfo.status === 'failed' && testData.testSettings.screenshotOnFailure) {
      await page.screenshot({
        path: `test-results/youtube-integration-failure-${Date.now()}.png`,
        fullPage: true,
      });
    }
  });
});

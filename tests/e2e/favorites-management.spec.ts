import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage';
import { LivePage } from '../../src/pages/LivePage';
import { FavoritesPage } from '../../src/pages/FavoritesPage';
import { AuthHelper } from '../../src/helpers/auth-helper';
import { testData } from '../../src/utils/test-data';

test.describe('Favorites Management', () => {
  let loginPage: LoginPage;
  let livePage: LivePage;
  let favoritesPage: FavoritesPage;

  test.beforeEach(async ({ page }) => {
    // Initialize page objects
    loginPage = new LoginPage(page);
    livePage = new LivePage(page);
    favoritesPage = new FavoritesPage(page);

    // Navigate to Favbet homepage
    await page.goto(testData.favbet.urls.homepage);
    
    // Ensure user is logged in
    await AuthHelper.ensureLoggedIn(page);

    // Clear all favorites to start with clean state
    try {
      await livePage.navigateToLive();
      await favoritesPage.navigateToFavorites();
      await page.waitForTimeout(testData.timeouts.short);
      let removedCount = await favoritesPage.removeAllFromFavorites();
      console.log(`Cleared ${removedCount} favorite(s) before test`);
    } catch (error) {
      console.warn('Failed to clear favorites before test:', error);
    }
  });

  test('should add items to favorites and manage them', async ({ page }) => {
    // Test steps according to assignment:
    // 1. Login to favbet.ua (done in beforeEach)
    
    // 2. Navigate to Live
    await test.step('Navigate to Live section', async () => {
      await livePage.navigateToLive();
      
      // Verify we're on a live sports page  
      expect(page.url()).toMatch(/\/(live|sports)/i);
    });

    // 3. Add several items to favorites
    let addedFavorites: string[] = [];
    await test.step('Add several items to favorites', async () => {
      // Get count of live events using event-id selector
      const liveEventsCount = await livePage.getEventCountByEventId();
      console.log(`Found ${liveEventsCount} live events available`);
      
      expect(liveEventsCount).toBeGreaterThan(0);
      
      const numberOfFavorites = testData.testSettings.numberOfFavoritesToAdd;
      addedFavorites = await livePage.addMultipleToFavorites(numberOfFavorites);
      
      // Verify favorites were added
      expect(addedFavorites.length).toBeGreaterThan(0);
      expect(addedFavorites.length).toBeLessThanOrEqual(numberOfFavorites);
      
      console.log(`Added ${addedFavorites.length} items to favorites:`, addedFavorites);
    });

    // 4. Navigate to favorites
    await test.step('Navigate to favorites page', async () => {
      await favoritesPage.navigateToFavorites();
      
      // Verify we're on the favorites page
      expect(page.url()).toContain('/favorites');
    });

    // 5. Check selected items are present
    await test.step('Verify favorited items are present', async () => {
      // Wait for favorites count to match expected using our tested event-id selector approach
      let favoritesCount = 0;
      await expect(async () => {
        favoritesCount = await favoritesPage.getFavoritesCountByEventId();
        
        expect(favoritesCount).toBeGreaterThan(0);
        expect(favoritesCount).toBe(addedFavorites.length);

        return favoritesCount;
      }).toPass({ timeout: 15_000 });
      
      console.log(`Verified ${favoritesCount} favorites are present on the favorites page`);
    });

    // 6. Remove any item
    let removedItemTitle: string = '';
    await test.step('Remove one item from favorites', async () => {
      const favoriteItems = await favoritesPage.getFavoriteItems();
      expect(favoriteItems.length).toBeGreaterThan(0);
      
      // Remove the first item
      removedItemTitle = favoriteItems[0].title;
      const removeSuccess = await favoritesPage.removeFavoriteByIndex(0);
      expect(removeSuccess).toBe(true);
      
      console.log(`Removed item: ${removedItemTitle}`);
    });

    // 7. Refresh page and check item is removed
    await test.step('Refresh page and verify item is removed', async () => {
      // Refresh the page
      await favoritesPage.refreshAndWaitForPageLoad();
      
      // Verify the removed item is no longer present
      // Wait for the removed item to no longer be present
      await expect(async () => {
        await favoritesPage.refreshAndWaitForPageLoad();

        const isRemovedItemPresent = await favoritesPage.isFavoritePresent(removedItemTitle);
        expect(isRemovedItemPresent).toBe(false);
      }).toPass({ timeout: testData.timeouts.medium });
    });
  });

  test.afterEach(async ({ page }, testInfo) => {
    // Take screenshot on failure
    if (testInfo.status === 'failed' && testData.testSettings.screenshotOnFailure) {
      await page.screenshot({ 
        path: `test-results/favorites-management-failure-${Date.now()}.png`,
        fullPage: true 
      });
    }
  });
});
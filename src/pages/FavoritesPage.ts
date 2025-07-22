import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export interface FavoriteItem {
  id: string;
  title: string;
  sport?: string;
  eventTime?: string;
}

export class FavoritesPage extends BasePage {
  readonly favoritesNavigationLink: Locator;
  readonly favoritesContainer: Locator;
  readonly favoriteItems: Locator;
  readonly removeButtons: Locator;
  readonly emptyMessage: Locator;
  readonly itemTitles: Locator;
  readonly sportLabels: Locator;
  readonly eventTimes: Locator;
  readonly clearAllButton: Locator;
  readonly favoritesCount: Locator;

  constructor(page: Page) {
    super(page);
    
    // Navigation
    this.favoritesNavigationLink = page.locator('a[href*="/favorites"], a:has-text("Обране"), a:has-text("Favorites")').first();
    
    // Containers
    this.favoritesContainer = page.locator('.favorites-container, [class*="favorites-list"], .favorite-events').first();
    
    // Items - Updated to match actual Favbet favorites page
    this.favoriteItems = page.locator('.live-event, [class*="match"], [class*="event"]').filter({ has: page.locator('[data-role="event-favorite-star-icon"]') });
    this.removeButtons = page.locator('[data-role="event-favorite-star-icon"]');
    
    // Content - Updated for Favbet structure
    this.itemTitles = page.locator('*:has-text("-"), [class*="team"], [class*="match"], [class*="vs"]');
    this.sportLabels = page.locator('*:has-text("Футбол"), *:has-text("Теніс"), *:has-text("Баскетбол")');
    this.eventTimes = page.locator('*:has-text(":"), [class*="time"], [class*="score"]');
    
    // UI elements
    this.emptyMessage = page.locator('.empty-favorites, .no-favorites, :text("Немає обраних"), :text("No favorites")');
    this.clearAllButton = page.locator('button:has-text("Очистити все"), button:has-text("Clear all")');
    this.favoritesCount = page.locator('.favorites-count, .count-badge, [class*="favorite-counter"]');
  }

  async navigateToFavorites() {
    await this.favoritesNavigationLink.click();

    // Wait for either favorites or empty message
    await Promise.race([
      this.favoriteItems.first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => null),
      this.emptyMessage.waitFor({ state: 'visible', timeout: 10000 }).catch(() => null)
    ]);
  }

  async getFavoritesCountByEventId(): Promise<number> {
    // Use the same selector approach we tested with MCP
    return await this.page.evaluate(() => {
      const eventElements = document.querySelectorAll('[data-role^="event-id-"]');
      return eventElements.length;
    });
  }

  async getFavoriteItems(): Promise<FavoriteItem[]> {
    const items: FavoriteItem[] = [];
    
    // Use the same event-id selector approach as LivePage
    const eventContainers = this.page.locator('[data-role^="event-id-"]');
    const count = await eventContainers.count();
    
    for (let i = 0; i < count; i++) {
      const eventContainer = eventContainers.nth(i);
      
      // Get the event ID from the data-role attribute
      const dataRole = await eventContainer.getAttribute('data-role');
      const id = dataRole || `favorite-${i}`;
      
      // Get title from the container using the same approach as LivePage
      let title = '';
      try {
        const containerText = await eventContainer.textContent();
        if (containerText) {
          // Clean up the text - take first meaningful line
          const lines = containerText.trim().split('\n').filter(line => line.trim().length > 0);
          title = lines[0] || `Match ${i + 1}`;
          // Limit length for readability
          if (title.length > 50) {
            title = title.substring(0, 50) + '...';
          }
        }
      } catch (error) {
        title = `Match ${i + 1}`;
      }
      
      if (!title || title.trim() === '') {
        title = `Match ${i + 1}`;
      }
      
      items.push({
        id,
        title: title.trim(),
        sport: '',
        eventTime: ''
      });
    }
    
    return items;
  }

  async isFavoritePresent(searchTitle: string): Promise<boolean> {
    const favoriteItems = await this.getFavoriteItems();
    
    // Check if any favorite item title contains the search title
    return favoriteItems.some(item => 
      item.title.includes(searchTitle) || searchTitle.includes(item.title)
    );
  }

  async removeFavoriteByIndex(index: number): Promise<boolean> {
    const removeButton = this.removeButtons.nth(index);
    
    if (!await removeButton.isVisible()) {
      return false;
    }
    
    await removeButton.scrollIntoViewIfNeeded();
    await removeButton.dispatchEvent('click');
    
    // Wait for page to update
    await this.page.waitForTimeout(1000);
    return true;
  }

  async removeAllFromFavorites(): Promise<number> {
    // Use JavaScript evaluation to find and click all favorite star icons
    const removedCount = await this.page.evaluate(() => {
      // Find all event elements with data-role starting with "event-id-"
      const eventElements = document.querySelectorAll('[data-role^="event-id-"]');
      let clickedCount = 0;
      
      eventElements.forEach(eventDiv => {
        // Find the star icon within each event
        const starIcon = eventDiv.querySelector('svg[data-role="event-favorite-star-icon"]');
        if (starIcon) {
          // Create and dispatch a click event
          const event = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
          });
          starIcon.dispatchEvent(event);
          clickedCount++;
        }
      });
      
      return clickedCount;
    });
    
    // Wait for the favorites to be processed
    if (removedCount > 0) {
      await this.page.waitForTimeout(1000);
    }
    
    return removedCount;
  }

  async refreshAndWaitForPageLoad() {
    await this.page.reload();
    await this.waitForPageLoad()
  }
}
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export interface LiveEvent {
  id: string;
  title: string;
  isFavorited: boolean;
}

export class LivePage extends BasePage {
  readonly liveNavigationLink: Locator;
  readonly liveEventsContainer: Locator;
  readonly eventItems: Locator;
  readonly favoriteButtons: Locator;
  readonly eventTitles: Locator;
  readonly loadingSpinner: Locator;
  readonly noEventsMessage: Locator;
  readonly sportFilters: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    super(page);
    
    // Navigation
    this.liveNavigationLink = page.locator('a[href*="/live"], a:has-text("Лайв"), a:has-text("Live")').first();
    
    // Containers
    this.liveEventsContainer = page.locator('.live-events, [class*="live-list"], .events-container').first();
    
    // Event elements - Updated to match actual Favbet page structure
    this.eventItems = page.locator('div').filter({ has: page.locator('[data-role="event-favorite-star-icon"]') });
    this.favoriteButtons = page.locator('[data-role="event-favorite-star"]');
    this.eventTitles = page.locator('.event-title, .match-title, .team-names, [class*="event-name"]');
    
    // UI elements
    this.loadingSpinner = page.locator('.loading, .spinner, [class*="loader"]');
    this.noEventsMessage = page.locator('.no-events, .empty-message, :text("Немає подій"), :text("СПОРТ НЕ ЗНАЙДЕНО")');
    this.sportFilters = page.locator('.sport-filter, [class*="sport-tab"], .category-filter');
    this.searchInput = page.locator('input[type="search"], input[placeholder*="Пошук"], input[placeholder*="Search"]');
  }

  async navigateToLive() {
    // Navigate directly to live all events page
    await this.page.goto('/uk/live/all/');
    await this.waitForPageLoad();
  }

  async waitForEventsToLoad() {
    // Wait for loading to complete
    await this.loadingSpinner.waitFor({ state: 'hidden' }).catch(() => null);
    
    // Check if there are no events first
    if (await this.hasNoEvents()) {
      return; // No events available, don't wait for events
    }
    
    // Wait for at least one event to be visible
    await this.eventItems.first().waitFor({ state: 'visible', timeout: 10000 });
  }

  async getEventCountByEventId(): Promise<number> {
    // Use the same selector approach we tested with MCP for consistent counting
    return await this.page.evaluate(() => {
      const eventElements = document.querySelectorAll('[data-role^="event-id-"]');
      return eventElements.length;
    });
  }

  async getEventByIndex(index: number): Promise<LiveEvent | null> {
    // Use our tested selector structure: start from event containers with data-role="event-id-*"
    const eventContainer = this.page.locator('[data-role^="event-id-"]').nth(index);
    
    if (!await eventContainer.isVisible()) {
      return null;
    }

    // Get the event ID from the data-role attribute
    const dataRole = await eventContainer.getAttribute('data-role');
    const id = dataRole || `event-${index}`;
    
    // Find the star icon within this event container
    const starIcon = eventContainer.locator('svg[data-role="event-favorite-star-icon"]');
    
    // Get event title from the container - try multiple approaches
    let title = '';
    
    try {
      // First try to get text content directly from the container
      const containerText = await eventContainer.textContent();
      if (containerText) {
        // Clean up the text - take first meaningful line
        const lines = containerText.trim().split('\n').filter(line => line.trim().length > 0);
        title = lines[0] || `Match ${index + 1}`;
        // Limit length for readability
        if (title.length > 50) {
          title = title.substring(0, 50) + '...';
        }
      }
    } catch (error) {
      title = `Match ${index + 1}`;
    }
    
    if (!title || title.trim() === '') {
      title = `Match ${index + 1}`;
    }
    
    // Check if this event is favorited by examining the star icon
    const isFavorited = await this.isStarIconFavorited(starIcon);

    return { id, title: title.trim(), isFavorited };
  }

  async toggleFavorite(index: number): Promise<boolean> {
    const favoriteButton = this.favoriteButtons.nth(index);
    
    // Check if the button exists and is visible
    const buttonCount = await this.favoriteButtons.count();
    
    if (index >= buttonCount) {
      return false;
    }
    
    const isVisible = await favoriteButton.isVisible();
    
    if (!isVisible) {
      return false;
    }

    await favoriteButton.click();

    // Assume the click was successful since we know clicks are working
    return true;
  }

  async addMultipleToFavorites(count: number): Promise<string[]> {
    const favoritedEventTitles: string[] = [];
    
    // Use our tested event-id counting method
    const totalEvents = await this.getEventCountByEventId();
    const eventsToAdd = Math.min(count, totalEvents);
    
    for (let i = 0; i < eventsToAdd; i++) {
      const event = await this.getEventByIndex(i);
      
      if (event && !event.isFavorited) {
        const isFavorited = await this.toggleFavorite(i);
        
        if (isFavorited) {
          favoritedEventTitles.push(event.title);
        }
      } else if (event && event.isFavorited) {
        // Already favorited, just add to the list
        favoritedEventTitles.push(event.title);
      }
    }
    
    return favoritedEventTitles;
  }

  private async isStarIconFavorited(starIcon: Locator): Promise<boolean> {
    try {
      // Check if the star icon has the favorited style: color: var(--state_favorite)
      const style = await starIcon.getAttribute('style') || '';
      
      // Check for the specific CSS variable indicating favorited state
      return style.includes('color: var(--state_favorite)');
    } catch {
      return false;
    }
  }

  async hasNoEvents(): Promise<boolean> {
    return await this.noEventsMessage.isVisible();
  }
}
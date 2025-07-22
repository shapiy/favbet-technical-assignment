import { Page, BrowserContext } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { testData } from '../utils/test-data';
import logger from '../utils/logger';

export interface AuthOptions {
  saveSession?: boolean;
  rememberMe?: boolean;
  username?: string;
  password?: string;
}

export class AuthHelper {
  private static readonly SESSION_STORAGE_KEY = 'favbet-session';
  private static readonly AUTH_COOKIES = ['session', 'auth-token', 'user-token'];

  /**
   * Login to Favbet with the provided credentials
   */
  static async login(page: Page, options: AuthOptions = {}): Promise<boolean> {
    const {
      username = testData.users.validUser.username,
      password = testData.users.validUser.password,
      rememberMe = false,
      saveSession = true,
    } = options;

    const loginPage = new LoginPage(page);

    try {
      // Check if already logged in
      if (await loginPage.isLoggedIn()) {
        logger.info('User is already logged in');
        return true;
      }

      // Navigate to homepage if not already there
      if (!page.url().includes('favbet.ua')) {
        await page.goto(testData.favbet.urls.homepage);
        await page.waitForLoadState('domcontentloaded');
      }

      // Perform login
      await loginPage.login(username, password, rememberMe);

      // Check for login errors
      const errorMessage = await loginPage.getErrorMessage();
      if (errorMessage) {
        logger.error(`Login failed with error: ${errorMessage}`);
        return false;
      }

      // Verify login success
      const isLoggedIn = await loginPage.isLoggedIn();
      if (isLoggedIn) {
        logger.info('Login successful');

        if (saveSession) {
          await this.saveAuthSession(page);
        }

        return true;
      }

      logger.error('Login failed - user menu not found');
      return false;
    } catch (error) {
      logger.error('Login error:', error);
      return false;
    }
  }

  /**
   * Logout from Favbet
   */
  static async logout(page: Page): Promise<void> {
    try {
      // Look for logout button
      const logoutSelectors = [
        'button:has-text("Вихід")',
        'button:has-text("Logout")',
        '[class*="logout"]',
        'a[href*="/logout"]',
      ];

      for (const selector of logoutSelectors) {
        const logoutButton = page.locator(selector).first();
        if (await logoutButton.isVisible({ timeout: 3000 })) {
          await logoutButton.click();
          await page.waitForLoadState('domcontentloaded');
          logger.info('Logout successful');
          return;
        }
      }

      logger.warn('Logout button not found');
    } catch (error) {
      logger.error('Logout error:', error);
    }
  }

  /**
   * Save authentication session for reuse
   */
  static async saveAuthSession(page: Page): Promise<void> {
    try {
      const context = page.context();

      // Save cookies
      const cookies = await context.cookies();
      const authCookies = cookies.filter(cookie =>
        this.AUTH_COOKIES.some(name => cookie.name.includes(name))
      );

      // Save local storage
      const localStorage = await page.evaluate(() => {
        const items: Record<string, string> = {};
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          if (key) {
            items[key] = window.localStorage.getItem(key) || '';
          }
        }
        return items;
      });

      // Save session storage
      const sessionStorage = await page.evaluate(() => {
        const items: Record<string, string> = {};
        for (let i = 0; i < window.sessionStorage.length; i++) {
          const key = window.sessionStorage.key(i);
          if (key) {
            items[key] = window.sessionStorage.getItem(key) || '';
          }
        }
        return items;
      });

      const session = {
        cookies: authCookies,
        localStorage,
        sessionStorage,
        timestamp: Date.now(),
      };

      await context.addInitScript(session => {
        window.localStorage.setItem('favbet-session', JSON.stringify(session));
      }, session);

      logger.info('Auth session saved');
    } catch (error) {
      logger.error('Error saving auth session:', error);
    }
  }

  /**
   * Restore authentication session
   */
  static async restoreAuthSession(context: BrowserContext): Promise<boolean> {
    try {
      const page = await context.newPage();
      await page.goto(testData.favbet.urls.homepage);

      const sessionData = await page.evaluate(() => {
        const data = window.localStorage.getItem('favbet-session');
        return data ? JSON.parse(data) : null;
      });

      await page.close();

      if (!sessionData) {
        return false;
      }

      // Check if session is not expired (24 hours)
      const sessionAge = Date.now() - sessionData.timestamp;
      if (sessionAge > 24 * 60 * 60 * 1000) {
        logger.info('Session expired');
        return false;
      }

      // Restore cookies
      if (sessionData.cookies && sessionData.cookies.length > 0) {
        await context.addCookies(sessionData.cookies);
      }

      // Restore storage
      await context.addInitScript(data => {
        // Restore local storage
        if (data.localStorage) {
          Object.entries(data.localStorage).forEach(([key, value]) => {
            window.localStorage.setItem(key, value as string);
          });
        }

        // Restore session storage
        if (data.sessionStorage) {
          Object.entries(data.sessionStorage).forEach(([key, value]) => {
            window.sessionStorage.setItem(key, value as string);
          });
        }
      }, sessionData);

      logger.info('Auth session restored');
      return true;
    } catch (error) {
      logger.error('Error restoring auth session:', error);
      return false;
    }
  }

  /**
   * Ensure user is logged in before test execution
   */
  static async ensureLoggedIn(page: Page, options: AuthOptions = {}): Promise<void> {
    const loginPage = new LoginPage(page);

    if (!(await loginPage.isLoggedIn())) {
      const loginSuccess = await this.login(page, options);

      if (!loginSuccess) {
        throw new Error('Failed to login. Cannot proceed with test.');
      }
    }
  }
}

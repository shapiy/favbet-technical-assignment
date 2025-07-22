import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import {testData} from "@utils/test-data";

export class LoginPage extends BasePage {
  readonly loginButton: Locator;
  readonly emailOrPhoneInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly closeModalButton: Locator;
  readonly loginForm: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly forgotPasswordLink: Locator;
  readonly registrationLink: Locator;

  constructor(page: Page) {
    super(page);
    
    // Main login button on header (it's actually a link with "Вхід" text)
    this.loginButton = page.locator('a:has-text("Вхід"), a:has-text("Login")').first();
    
    // Login form elements - using role-based selectors that match the actual form
    this.emailOrPhoneInput = page.getByRole('textbox', { name: 'Електронна пошта' });
    this.passwordInput = page.getByRole('textbox', { name: 'Пароль' });
    this.submitButton = page.getByRole('button', { name: 'Увійти' });
    
    // Additional elements
    this.errorMessage = page.locator('.error-message, .login-error, [class*="error"]');
    this.closeModalButton = page.locator('button[aria-label="Close"], .modal-close, .close-button');
    this.loginForm = page.locator('form[class*="login"], .login-form, #loginForm');
    this.rememberMeCheckbox = page.locator('input[type="checkbox"][name="remember"], .remember-checkbox');
    this.forgotPasswordLink = page.locator('a:has-text("Забули пароль"), a:has-text("Forgot password")');
    this.registrationLink = page.locator('a:has-text("Реєстрація"), a:has-text("Registration")');
  }

  async openLoginForm() {
    await this.loginButton.click();
    await this.page.waitForLoadState('networkidle');
    
    // Check if we're on the login page
    await this.page.waitForURL('**/login/**', { timeout: 10000 });
    
    // Wait for form elements to be visible
    await this.emailOrPhoneInput.waitFor({ state: 'visible', timeout: 10000 });
  }

  async login(emailOrPhone: string, password: string, rememberMe: boolean = false) {
    // Check if we're already on the login page, otherwise open it
    if (!this.page.url().includes('/login/')) {
      await this.openLoginForm();
    } else {
      // Wait for form elements to be visible if we're already on login page
      await this.emailOrPhoneInput.waitFor({ state: 'visible', timeout: 10000 });
    }

    // Fill in credentials
    await this.emailOrPhoneInput.fill(emailOrPhone);
    await this.passwordInput.fill(password);

    // Handle remember me checkbox
    if (rememberMe) {
      const isChecked = await this.rememberMeCheckbox.isChecked().catch(() => false);
      if (!isChecked) {
        await this.rememberMeCheckbox.check();
      }
    }

    // Submit the form
    await this.submitButton.click();
    
    // Wait for either success (navigation away from login page) or error message
    await Promise.race([
      this.page.waitForURL(url => !url.toString().includes('/login/'), { timeout: 10000 }),
      this.errorMessage.waitFor({ state: 'visible', timeout: testData.timeouts.short }).catch(() => null)
    ]);
  }

  async isLoggedIn(): Promise<boolean> {
    // Check if user menu or balance indicator is visible (signs of being logged in)
    const loggedInSelectors = [
      'a:has-text("Депозит")', // Deposit button appears when logged in
      '[class*="user-menu"]',
      '[class*="account"]',
      '.user-balance',
      'button:has-text("Вихід")',
      'button:has-text("Logout")',
      // Check if balance indicator is present (shows 0.00 ₴ when logged in)
      '*:has-text("₴")'
    ];
    
    for (const selector of loggedInSelectors) {
      const element = await this.page.locator(selector).first();
      if (await element.isVisible().catch(() => false)) {
        return true;
      }
    }
    
    // Alternative check: if we're not on login page and login button is not visible, likely logged in
    if (!this.page.url().includes('/login/')) {
      const loginButtonVisible = await this.loginButton.isVisible().catch(() => false);
      if (!loginButtonVisible) {
        return true;
      }
    }
    
    return false;
  }

  async getErrorMessage(): Promise<string | null> {
    try {
      await this.errorMessage.waitFor({ state: 'visible', timeout: 3000 });
      return await this.errorMessage.textContent();
    } catch {
      return null;
    }
  }
}

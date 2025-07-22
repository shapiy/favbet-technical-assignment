import { test as setup } from '@playwright/test';
import { AuthHelper } from '../src/helpers/auth-helper';
import { testData } from '../src/utils/test-data';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Perform authentication steps
  await page.goto(testData.favbet.urls.homepage);

  // Use AuthHelper to login
  const loginSuccess = await AuthHelper.login(page);

  if (!loginSuccess) {
    throw new Error('Authentication failed');
  }

  // Wait for page to be fully loaded after login
  await page.waitForLoadState('domcontentloaded');

  // Save signed-in state to 'authFile'
  await page.context().storageState({ path: authFile });
});

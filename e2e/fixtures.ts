/**
 * E2E Test Fixtures
 *
 * Helper functions and fixtures for E2E testing
 */

import { test as base } from '@playwright/test';

// Test user credentials - should match backend test data
export const TEST_USER = {
  email: 'test@example.com',
  password: 'password123',
  name: '测试用户'
};

export const TEST_PRO_USER = {
  email: 'pro@example.com',
  password: 'password123',
  name: 'Pro用户'
};

/**
 * Extended test with authentication fixtures
 */
export const test = base.extend({
  // authenticated page - logs in before each test
  authenticatedPage: async ({ page }, use) => {
    // Navigate to login page
    await page.goto('/login');

    // Fill in login form
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    await use(page);
  },

  // pro authenticated page - logs in as pro user
  proAuthenticatedPage: async ({ page }, use) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', TEST_PRO_USER.email);
    await page.fill('input[name="password"]', TEST_PRO_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    await page.waitForLoadState('networkidle');

    await use(page);
  }
});

/**
 * Helper function to perform login
 */
export async function login(page: ReturnType<typeof base.fixtures.page>, user = TEST_USER) {
  await page.goto('/login');
  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="password"]', user.password);
  await page.click('button[type="submit"]');

  // Wait for navigation
  await page.waitForURL(/\/(dashboard|settings)/, { timeout: 10000 });
  await page.waitForLoadState('networkidle');
}

/**
 * Helper function to perform logout
 */
export async function logout(page: ReturnType<typeof base.fixtures.page>) {
  // Click logout button (in header or sidebar)
  const logoutButton = page.locator('button:has-text("退出"), a:has-text("退出"), button:has-text("登出")').first();

  if (await logoutButton.count() > 0) {
    await logoutButton.click();
    // Wait for redirect to home or login
    await page.waitForURL(/(\/$|\/login)/, { timeout: 5000 });
  }
}

/**
 * Helper function to register a new user
 */
export async function register(page: ReturnType<typeof base.fixtures.page>, userInfo: {
  email: string;
  password: string;
  name: string;
  plan?: 'trial' | 'free';
}) {
  await page.goto('/register');

  // Fill registration form
  await page.fill('input[name="name"]', userInfo.name);
  await page.fill('input[name="email"]', userInfo.email);
  await page.fill('input[name="password"]', userInfo.password);
  await page.fill('input[name="confirmPassword"]', userInfo.password);

  // Select plan if specified
  if (userInfo.plan) {
    const planOption = page.locator(`text=${userInfo.plan === 'trial' ? '14天试用版' : '永久免费版'}`);
    await planOption.click();
  }

  // Submit form
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard
  await page.waitForURL(/\/dashboard/, { timeout: 10000 });
  await page.waitForLoadState('networkidle');
}

/**
 * Helper function to check if user is on login page
 */
export async function isOnLoginPage(page: ReturnType<typeof base.fixtures.page>): Promise<boolean> {
  const url = page.url();
  return url.includes('/login');
}

/**
 * Helper function to get current user from localStorage
 */
export async function getStoredUser(page: ReturnType<typeof base.fixtures.page>) {
  return await page.evaluate(() => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  });
}

/**
 * Helper function to get auth token from localStorage
 */
export async function getAuthToken(page: ReturnType<typeof base.fixtures.page>) {
  return await page.evaluate(() => {
    return localStorage.getItem('auth_token');
  });
}

/**
 * Helper function to set auth token directly (for testing purposes)
 */
export async function setAuthToken(page: ReturnType<typeof base.fixtures.page>, token: string, user: any) {
  await page.evaluate(({ token, user }) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }, { token, user });

  // Reload to apply auth state
  await page.reload();
  await page.waitForLoadState('networkidle');
}

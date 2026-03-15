/**
 * E2E Test Fixtures - Simplified version
 *
 * Helper functions for E2E testing with API mocking
 */

import { test as base, type Page } from '@playwright/test';

// Test user credentials
export const TEST_USER = {
  id: 'test-user-id',
  email: 'test@example.com',
  password: 'password123',
  name: '测试用户',
  plan_tier: 'pro' as const,
  plan_status: 'active' as const,
  created_at: new Date().toISOString(),
  last_login_at: new Date().toISOString(),
  currency_preference: 'CNY',
  is_admin: false
};

export const TEST_PRO_USER = {
  id: 'pro-user-id',
  email: 'pro@example.com',
  password: 'password123',
  name: 'Pro用户',
  plan_tier: 'pro' as const,
  plan_status: 'active' as const,
  created_at: new Date().toISOString(),
  last_login_at: new Date().toISOString(),
  currency_preference: 'CNY',
  is_admin: false
};

// API base URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.zenconsult.top';

/**
 * Setup API mocking for authenticated requests
 */
async function setupApiMocking(page: Page, user: typeof TEST_USER) {
  // Mock GET /api/v1/users/me - return test user
  await page.route(`${API_BASE}/api/v1/users/me`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(user)
    });
  });

  // Mock GET /api/v1/subscriptions/me - return subscription info
  await page.route(`${API_BASE}/api/v1/subscriptions/me`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        plan: user.plan_tier,
        status: user.plan_status,
        started_at: user.created_at,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })
    });
  });

  // Mock GET /api/v1/favorites - return empty favorites
  await page.route(`${API_BASE}/api/v1/favorites*`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ favorites: [], total: 0 })
    });
  });
}

/**
 * Helper function to set mock authentication with API mocking
 */
export async function setMockAuth(page: Page, user: typeof TEST_USER = TEST_USER) {
  // Setup API mocking first
  await setupApiMocking(page, user);

  // Add init script to set localStorage before page loads
  await page.addInitScript(({ user, token }: { user: any; token: string }) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }, {
    user: user,
    token: 'mock_test_token_for_e2e'
  });

  // Navigate to dashboard - the init script will run automatically
  await page.goto('/dashboard');
  // Wait for the page to be hydrated and rendered
  await page.waitForLoadState('networkidle');
}

/**
 * Helper function to perform login in E2E tests
 * Note: This is a stub - real login tests should use the actual login page
 */
export async function login(page: any, email?: string, password?: string) {
  // Navigate to login page
  await page.goto('/login');

  // Fill in credentials if provided
  if (email && password) {
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
  }

  // Wait for navigation
  await page.waitForLoadState('domcontentloaded');
}

/**
 * Helper function to perform registration in E2E tests
 * Note: This is a stub - real registration tests should use the actual register page
 */
export async function register(page: any, email: string, password: string, name: string, plan?: 'trial' | 'free') {
  // Navigate to register page
  await page.goto('/register');

  // Fill in registration form
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.fill('input[name="name"]', name);

  // Select plan if specified
  if (plan) {
    await page.click(`button[value="${plan}"]`);
  }

  // Submit form
  await page.click('button[type="submit"]');

  // Wait for navigation
  await page.waitForLoadState('domcontentloaded');
}

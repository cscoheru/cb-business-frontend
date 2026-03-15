/**
 * E2E Test Fixtures - Simplified version
 *
 * Helper functions for E2E testing without using fixtures.extend
 */

import { test as base } from '@playwright/test';

// Test user credentials
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
 * Helper function to set mock authentication
 */
export async function setMockAuth(page: any) {
  // First navigate to a safe page (home page)
  await page.goto('/');

  // Wait for the page to be ready
  await page.waitForLoadState('domcontentloaded');

  // Add init script to set localStorage before page loads
  await page.addInitScript(({ user, token }: { user: any; token: string }) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }, {
    user: {
      id: 'test-user-id',
      email: TEST_USER.email,
      name: TEST_USER.name,
      plan_tier: 'pro' as const,
      plan_status: 'active' as const,
      created_at: new Date().toISOString(),
      last_login_at: new Date().toISOString(),
      currency_preference: 'CNY',
      is_admin: false
    },
    token: 'mock_test_token_for_e2e'
  });

  // Navigate to dashboard - the init script will run automatically
  await page.goto('/dashboard');
  await page.waitForLoadState('domcontentloaded');
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

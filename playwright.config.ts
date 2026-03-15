import { defineConfig, devices } from '@playwright/test';

// Use local server by default, production for CI or when BASE_URL is explicitly set
const isLocal = !process.env.CI && !process.env.BASE_URL;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.BASE_URL || (isLocal ? 'http://localhost:3002' : 'https://www.zenconsult.top'),
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Run local dev server before starting tests
  // Set BASE_URL=https://www.zenconsult.top to test against production
  webServer: isLocal ? {
    command: 'PORT=3002 npm run dev',
    url: 'http://localhost:3002',
    reuseExistingServer: true,
    timeout: 120000,
    stdout: 'pipe',
    stderr: 'pipe',
  } : undefined,
});

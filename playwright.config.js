import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  // Runs once before the suite — creates the shared Playwright test account if needed
  globalSetup: './tests/global-setup.js',

  // Directory where tests live
  testDir: './tests/e2e',

  // Run tests in parallel
  fullyParallel: true,

  // Fail the build on CI if test.only is accidentally left in
  forbidOnly: !!process.env.CI,

  // Retry failed tests once on CI
  retries: process.env.CI ? 1 : 0,

  // Reporter: list in terminal, HTML report saved to playwright-report/
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    // Base URL for all tests — points at local Vite dev server
    baseURL: 'http://localhost:5173',

    // Capture trace on first retry for easier debugging
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Start the Vite dev server before running tests, stop it after
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true, // reuse if already running (e.g. during development)
    timeout: 30000,
  },
})

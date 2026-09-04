import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  /* Paths resolve relative to THIS config file (tests/), not the repo root. */
  testDir: './components',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:6006',
    screenshot: 'only-on-failure',
    // reducedMotion is a BrowserContext option — set it per-project via contextOptions below
  },
  projects: [{
    name: 'chromium',
    use: {
      ...devices['Desktop Chrome'],
      contextOptions: { reducedMotion: 'reduce' },
    },
  }],
  webServer: {
    command: 'npm run storybook',
    url: 'http://localhost:6006',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  snapshotDir: './__snapshots__',
  reporter: process.env.CI ? 'github' : 'html',
})

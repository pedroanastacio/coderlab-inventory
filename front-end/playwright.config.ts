import { defineConfig } from '@playwright/test'

const baseUrl = process.env.VITE_BASE_URL || 'http://localhost:5173';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: baseUrl,
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'pnpm dev',
    url: baseUrl,
    reuseExistingServer: !process.env.CI,
  },
})

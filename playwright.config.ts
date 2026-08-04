import { defineConfig, devices } from '@playwright/test'

const PORT = process.env.PW_PORT ?? '3000'
const BASE_URL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['list'],
    [
      'monocart-reporter',
      {
        name: 'DSTA Frontend - Playwright Report',
        outputFile: './playwright-report/index.html',
        coverage: {
          entryFilter: () => true,
          sourceFilter: (sourcePath: string) => sourcePath.search(/src\//) !== -1,
          outputDir: './coverage/playwright',
        },
      },
    ],
  ],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `npx next dev -p ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})

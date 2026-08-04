import { test as base, expect, type Page, type Route } from '@playwright/test'
import { addCoverageReport } from 'monocart-reporter'
import { users, FAKE_TOKEN, type profiles } from './users'
import type { User } from '@/types/user'

type Role = keyof typeof profiles

type Fixtures = {
  loginAs: (role: Role) => Promise<void>
  mockApi: (path: string | RegExp, body: unknown, opts?: { status?: number; method?: string }) => Promise<void>
  collectCoverage: string
}

/** Envelope used across the app: `{ code, message, data }`. */
export function envelope<T>(data: T, code = 0, message = 'OK') {
  return { code, message, data }
}

async function seedAuth(page: Page, user: User) {
  await page.addInitScript(
    ({ token, storeValue }) => {
      window.localStorage.setItem('dev_access_token', token)
      window.localStorage.setItem('auth-store', storeValue)
    },
    {
      token: FAKE_TOKEN,
      storeValue: JSON.stringify({
        state: { user, isAuthenticated: true },
        version: 0,
      }),
    },
  )
}

export const test = base.extend<Fixtures>({
  // Catch-all so any API call a spec forgets to mock fails fast (404) instead of
  // hanging on a real network request to a backend that isn't reachable in this env.
  page: async ({ page }, use) => {
    await page.route('**/api/v1/**', async (route: Route) => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ code: 404, message: 'Unmocked API call in e2e test', data: null }),
      })
    })
    await use(page)
  },
  loginAs: async ({ page }, use) => {
    await use(async (role: Role) => {
      await seedAuth(page, users[role])
    })
  },
  collectCoverage: [
    async ({ page }, use, testInfo) => {
      const isChromium = testInfo.project.name === 'chromium'
      if (isChromium) {
        await Promise.all([
          page.coverage.startJSCoverage({ resetOnNavigation: false }),
          page.coverage.startCSSCoverage({ resetOnNavigation: false }),
        ])
      }

      await use('collectCoverage')

      if (isChromium) {
        const [jsCoverage, cssCoverage] = await Promise.all([
          page.coverage.stopJSCoverage(),
          page.coverage.stopCSSCoverage(),
        ])
        await addCoverageReport([...jsCoverage, ...cssCoverage], testInfo)
      }
    },
    { auto: true },
  ],
  mockApi: async ({ page }, use) => {
    await use(async (path, body, opts) => {
      await page.route('**/api/v1/**', async (route: Route) => {
        const url = new URL(route.request().url())
        const matches =
          typeof path === 'string' ? url.pathname.includes(`/api/v1${path}`) : path.test(url.pathname)
        if (!matches || (opts?.method && route.request().method() !== opts.method)) {
          return route.fallback()
        }
        await route.fulfill({
          status: opts?.status ?? 200,
          contentType: 'application/json',
          body: JSON.stringify(body),
        })
      })
    })
  },
})

export { expect }
export { users, envelope as wrap }

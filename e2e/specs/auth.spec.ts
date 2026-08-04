import { test, expect, wrap } from '../fixtures/test-base'
import { profiles } from '../fixtures/users'

test.describe('Authentication', () => {
  test('logs in as a student via the real login form and lands on the dashboard', async ({
    page,
    mockApi,
  }) => {
    // Login response already carries the user profile, so getProfile() (a GET
    // triggered on session-restore for unauthenticated visits) is never needed
    // here — deliberately left unmocked so an accidental extra call fails loudly.
    await mockApi(
      '/auth/login',
      wrap({ accessToken: 'fake-token', user: profiles.student }),
      { method: 'POST' },
    )

    await page.goto('/')
    await page.getByPlaceholder('Email').fill('student01@edu.vn')
    await page.getByPlaceholder('Mật khẩu').fill('password123')
    await page.getByRole('button', { name: 'Đăng nhập' }).click()

    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('shows an error message on invalid credentials', async ({ page, mockApi }) => {
    await mockApi(
      '/auth/login',
      { code: 401, message: 'Invalid credentials', data: null },
      { method: 'POST', status: 401 },
    )

    await page.goto('/')
    await page.getByPlaceholder('Email').fill('wrong@edu.vn')
    await page.getByPlaceholder('Mật khẩu').fill('wrongpass')
    await page.getByRole('button', { name: 'Đăng nhập' }).click()

    await expect(page.getByText(/không đúng|Đăng nhập thất bại/i)).toBeVisible()
    await expect(page).toHaveURL('/')
  })

  test('redirects an already-authenticated student away from the login page', async ({
    page,
    loginAs,
  }) => {
    await loginAs('student')
    await page.goto('/')
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('unauthenticated user visiting a protected route is redirected to login', async ({
    page,
  }) => {
    await page.goto('/practice')
    await expect(page).toHaveURL('/')
  })
})

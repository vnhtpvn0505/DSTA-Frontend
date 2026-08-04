import { test, expect } from '../fixtures/test-base'

// Settings page is currently a static placeholder with no data fetching for
// either role — a single smoke test per role is sufficient.
test.describe('Settings page', () => {
  test('renders the placeholder content for a student', async ({ page, loginAs }) => {
    await loginAs('student')
    await page.goto('/settings')

    await expect(page.getByRole('heading', { name: 'Cài đặt' })).toBeVisible()
    await expect(page.getByText('Nội dung đang phát triển.')).toBeVisible()
  })

  test('renders the placeholder content for an admin', async ({ page, loginAs }) => {
    await loginAs('admin')
    await page.goto('/settings')

    await expect(page.getByRole('heading', { name: 'Cài đặt' })).toBeVisible()
    await expect(page.getByText('Nội dung đang phát triển.')).toBeVisible()
  })
})

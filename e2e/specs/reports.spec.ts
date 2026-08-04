import { test, expect } from '../fixtures/test-base'

test.describe('Reports page', () => {
  test('renders the summary and per-class report for an admin', async ({ page, loginAs }) => {
    await loginAs('admin')

    await page.goto('/reports')

    await expect(page.getByRole('heading', { name: 'Báo Cáo', exact: true })).toBeVisible()
    await expect(page.getByText('Báo cáo tổng quan')).toBeVisible()
    await expect(page.getByText('Báo cáo chi tiết theo lớp')).toBeVisible()
    await expect(page.getByText('10A1')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Xuất Excel' })).toBeVisible()
  })

  test('redirects a student away from the admin-only reports page', async ({ page, loginAs }) => {
    await loginAs('student')

    await page.goto('/reports')

    await expect(page).toHaveURL('/dashboard')
  })
})

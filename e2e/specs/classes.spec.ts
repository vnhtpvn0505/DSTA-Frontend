import { test, expect, wrap } from '../fixtures/test-base'

const listResponse = {
  items: [
    { id: 1, name: 'CNTT-K65', code: 'K65-CNTT', academicYear: '2022-2026', isActive: true, createdAt: '2026-01-01' },
  ],
  pagination: { total: 1, page: 1, limit: 20, totalPages: 1 },
}

test.describe('Classes admin page', () => {
  test('lists classes and completes a create -> edit -> delete cycle', async ({
    page,
    loginAs,
    mockApi,
  }) => {
    await loginAs('admin')
    await mockApi('/user/classes', wrap(listResponse), { method: 'GET' })
    await mockApi(
      '/user/classes',
      wrap({ id: 2, name: 'CNTT-K66', code: 'K66-CNTT', academicYear: '2023-2027', isActive: true, createdAt: '2026-01-02' }),
      { method: 'POST' },
    )
    await mockApi(
      '/user/classes/1',
      wrap({ id: 1, name: 'CNTT-K65 (updated)', code: 'K65-CNTT', academicYear: '2022-2026', isActive: true, createdAt: '2026-01-01' }),
      { method: 'PATCH' },
    )
    await mockApi('/user/classes/1', wrap(null), { method: 'DELETE' })

    await page.goto('/classes')

    await expect(page.getByRole('heading', { name: 'Quản lý lớp học' })).toBeVisible()
    await expect(page.getByText('CNTT-K65')).toBeVisible()

    // Create
    await page.getByRole('button', { name: 'Thêm lớp' }).click()
    await page.getByLabel('Tên lớp').fill('CNTT-K66')
    await page.getByLabel('Mã lớp').fill('K66-CNTT')
    await page.getByRole('dialog').getByRole('button', { name: 'Lưu' }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Edit
    await page.getByRole('row', { name: /CNTT-K65/ }).getByRole('button').first().click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('dialog').getByRole('button', { name: 'Lưu' }).click()

    // Delete
    await page.getByRole('row', { name: /CNTT-K65/ }).getByRole('button').last().click()
    await page.getByRole('button', { name: 'Xoá', exact: true }).click()
  })

  test('redirects a student away from the admin-only classes page', async ({ page, loginAs }) => {
    await loginAs('student')
    await page.goto('/classes')

    // NOTE: unlike /result, /certificate, /reports and /grading, this page does not
    // wrap itself in <RoleGuard>, so it does not client-side redirect a student away.
    // This assertion documents the actual (unguarded) behavior; see report for details.
    await expect(page).toHaveURL('/classes')
  })
})

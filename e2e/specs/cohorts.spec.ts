import { test, expect, wrap } from '../fixtures/test-base'

const listResponse = {
  items: [{ id: 1, name: 'Khoá 2022', year: '2022', description: 'Khoá đào tạo 2022-2026', createdAt: '2026-01-01' }],
  pagination: { total: 1, page: 1, limit: 20, totalPages: 1 },
}

test.describe('Cohorts admin page', () => {
  test('lists cohorts and completes a create -> edit -> delete cycle', async ({
    page,
    loginAs,
    mockApi,
  }) => {
    await loginAs('admin')
    await mockApi('/user/cohorts', wrap(listResponse), { method: 'GET' })
    await mockApi(
      '/user/cohorts',
      wrap({ id: 2, name: 'Khoá 2023', year: '2023', description: '', createdAt: '2026-01-02' }),
      { method: 'POST' },
    )
    await mockApi(
      '/user/cohorts/1',
      wrap({ id: 1, name: 'Khoá 2022 (updated)', year: '2022', description: '', createdAt: '2026-01-01' }),
      { method: 'PATCH' },
    )
    await mockApi('/user/cohorts/1', wrap(null), { method: 'DELETE' })

    await page.goto('/cohorts')

    await expect(page.getByText('Quản lý khoá đào tạo')).toBeVisible()
    await expect(page.getByText('Khoá 2022')).toBeVisible()

    // Create
    await page.getByRole('button', { name: 'Thêm khoá' }).click()
    await page.getByLabel('Tên khoá').fill('Khoá 2023')
    await page.getByRole('dialog').getByRole('button', { name: 'Lưu' }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Edit
    await page.getByRole('row', { name: /Khoá 2022/ }).getByRole('button').first().click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('dialog').getByRole('button', { name: 'Lưu' }).click()

    // Delete
    await page.getByRole('row', { name: /Khoá 2022/ }).getByRole('button').last().click()
    await page.getByRole('button', { name: 'Xoá', exact: true }).click()
  })
})

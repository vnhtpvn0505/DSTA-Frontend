import { test, expect, wrap } from '../fixtures/test-base'

const listResponse = {
  items: [
    {
      id: 1,
      name: 'Kỳ thi HK1 2026',
      startDate: '2026-08-01T00:00:00Z',
      endDate: '2026-08-31T23:59:59Z',
      examConfigId: 1,
      allowedClassIds: null,
      status: 'scheduled',
      createdAt: '2026-01-01',
    },
  ],
  pagination: { total: 1, page: 1, limit: 20, totalPages: 1 },
}

test.describe('Exam periods admin page', () => {
  test('lists exam periods and completes a create -> edit -> delete cycle', async ({
    page,
    loginAs,
    mockApi,
  }) => {
    await loginAs('admin')
    await mockApi('/user/exam-periods', wrap(listResponse), { method: 'GET' })
    await mockApi(
      '/user/exam-periods',
      wrap({ ...listResponse.items[0], id: 2, name: 'Kỳ thi HK2 2026' }),
      { method: 'POST' },
    )
    await mockApi(
      '/user/exam-periods/1',
      wrap({ ...listResponse.items[0], name: 'Kỳ thi HK1 2026 (updated)' }),
      { method: 'PATCH' },
    )
    await mockApi('/user/exam-periods/1', wrap(null), { method: 'DELETE' })

    await page.goto('/exam-periods')

    await expect(page.getByText('Quản lý kỳ thi')).toBeVisible()
    await expect(page.getByText('Kỳ thi HK1 2026')).toBeVisible()

    // Create
    await page.getByRole('button', { name: 'Thêm kỳ thi' }).click()
    await page.getByLabel('Tên kỳ thi').fill('Kỳ thi HK2 2026')
    await page.getByLabel('Ngày bắt đầu').fill('2026-09-01T00:00')
    await page.getByLabel('Ngày kết thúc').fill('2026-09-30T00:00')
    await page.getByRole('dialog').getByRole('button', { name: 'Lưu' }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Edit
    await page.getByRole('row', { name: /Kỳ thi HK1 2026/ }).getByRole('button').first().click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('dialog').getByRole('button', { name: 'Lưu' }).click()

    // Delete
    await page.getByRole('row', { name: /Kỳ thi HK1 2026/ }).getByRole('button').last().click()
    await page.getByRole('button', { name: 'Xoá', exact: true }).click()
  })
})

import { test, expect, wrap } from '../fixtures/test-base'

const listResponse = {
  items: [
    {
      id: 1,
      username: 'teacher01',
      firstName: 'Giang Vien A',
      email: 'teacher01@edu.vn',
      phoneNumber: '0900000003',
      facultyName: 'CNTT',
      createdAt: '2026-01-01',
    },
  ],
  pagination: { total: 1, page: 1, limit: 20, totalPages: 1 },
}

test.describe('Teachers admin page', () => {
  test('lists teachers and completes a create -> edit -> delete cycle', async ({
    page,
    loginAs,
    mockApi,
  }) => {
    await loginAs('admin')
    await mockApi('/user/teachers', wrap(listResponse), { method: 'GET' })
    await mockApi(
      '/user/teachers',
      wrap({ ...listResponse.items[0], id: 2, username: 'teacher02', firstName: 'Giang Vien B' }),
      { method: 'POST' },
    )
    await mockApi(
      '/user/teachers/1',
      wrap({ ...listResponse.items[0], firstName: 'Giang Vien A (updated)' }),
      { method: 'PATCH' },
    )
    await mockApi('/user/teachers/1', wrap(null), { method: 'DELETE' })

    await page.goto('/teachers')

    await expect(page.getByRole('heading', { name: 'Quản lý giảng viên' })).toBeVisible()
    await expect(page.getByText('Giang Vien A')).toBeVisible()

    // Create
    await page.getByRole('button', { name: 'Thêm giảng viên' }).click()
    await page.getByLabel('Tên đăng nhập').fill('teacher02')
    await page.getByLabel('Họ và tên').fill('Giang Vien B')
    await page.getByLabel('Email').fill('teacher02@edu.vn')
    await page.getByLabel('Mật khẩu').fill('password123')
    await page.getByRole('dialog').getByRole('button', { name: 'Lưu' }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Edit
    await page.getByRole('row', { name: /Giang Vien A/ }).getByRole('button').first().click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('dialog').getByRole('button', { name: 'Lưu' }).click()

    // Delete
    await page.getByRole('row', { name: /Giang Vien A/ }).getByRole('button').last().click()
    await page.getByRole('button', { name: 'Xoá', exact: true }).click()
  })

  test('shows a validation error when the create form is submitted empty', async ({
    page,
    loginAs,
    mockApi,
  }) => {
    await loginAs('admin')
    await mockApi('/user/teachers', wrap(listResponse), { method: 'GET' })

    await page.goto('/teachers')
    await page.getByRole('button', { name: 'Thêm giảng viên' }).click()
    await page.getByRole('dialog').getByRole('button', { name: 'Lưu' }).click()

    await expect(page.getByText('Bắt buộc').first()).toBeVisible()
  })
})

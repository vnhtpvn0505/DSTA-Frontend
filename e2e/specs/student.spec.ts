import { test, expect, wrap } from '../fixtures/test-base'

const studentsList = {
  items: [
    {
      id: 101,
      firstName: 'Nguyen Van A',
      email: 'student01@edu.vn',
      className: 'CNTT-K65',
      latestScore: 85,
      rankName: 'B2',
      isPassed: true,
    },
  ],
  pagination: { total: 1, page: 1, limit: 20, totalPages: 1 },
}

test.describe('Student management page (admin)', () => {
  test('shows stat cards and the student table', async ({ page, loginAs, mockApi }) => {
    await loginAs('admin')
    await mockApi(
      '/user/admin-stats',
      wrap({ totalStudents: 50, totalExams: 120, passRate: 80, avgScore: 75 }),
    )
    await mockApi('/user/students', wrap(studentsList))

    await page.goto('/student')

    await expect(page.getByRole('heading', { name: 'Quản lý sinh viên' })).toBeVisible()
    await expect(page.getByText('Tổng sinh viên', { exact: true })).toBeVisible()
    await expect(page.getByText('Nguyen Van A')).toBeVisible()
    await expect(page.getByText('student01@edu.vn')).toBeVisible()
  })

  test('shows an empty state when there are no students', async ({ page, loginAs, mockApi }) => {
    await loginAs('admin')
    await mockApi(
      '/user/admin-stats',
      wrap({ totalStudents: 0, totalExams: 0, passRate: 0, avgScore: 0 }),
    )
    await mockApi('/user/students', wrap({ items: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 1 } }))

    await page.goto('/student')

    await expect(page.getByRole('heading', { name: 'Quản lý sinh viên' })).toBeVisible()
  })
})

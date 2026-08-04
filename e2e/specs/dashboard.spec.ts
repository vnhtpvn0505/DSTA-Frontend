import { test, expect, wrap } from '../fixtures/test-base'

test.describe('Dashboard', () => {
  test('renders student stats and profile card for a student', async ({
    page,
    loginAs,
    mockApi,
  }) => {
    await loginAs('student')
    await mockApi(
      '/user/stats',
      wrap({ totalAttempts: 3, highestScore: 82, currentRank: 'B2', isPassed: true }),
    )
    await mockApi('/user/competency-scores', wrap([]))

    await page.goto('/dashboard')

    await expect(page.getByText(/Xin chào,/)).toBeVisible()
    await expect(page.getByText('Điểm số cao nhất')).toBeVisible()
    await expect(page.getByText('82/100')).toBeVisible()
    await expect(page.getByText('Xếp loại hiện tại')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Làm bài thi đánh giá năng lực số' })).toBeVisible()

    // Admin-only heading must not leak into the student dashboard
    await expect(page.getByText('Bảng thống kê')).not.toBeVisible()
  })

  test('renders admin stat cards and recent exams for an admin', async ({
    page,
    loginAs,
    mockApi,
  }) => {
    await loginAs('admin')
    await mockApi(
      '/user/admin-stats',
      wrap({ totalStudents: 120, totalExams: 340, passRate: 88.5, avgScore: 76.2 }),
    )
    await mockApi('/user/recent-exams', wrap([]))
    await mockApi('/user/level-distribution', wrap([]))

    await page.goto('/dashboard')

    await expect(page.getByRole('heading', { name: 'Bảng thống kê' })).toBeVisible()
    await expect(page.getByText('Tổng sinh viên')).toBeVisible()
    await expect(page.getByText('120')).toBeVisible()
    await expect(page.getByText('Bài thi hoàn thành')).toBeVisible()
    await expect(page.getByText('Tỉ lệ đạt')).toBeVisible()

    // Student-only content must not leak into the admin dashboard
    await expect(page.getByText(/Xin chào,/)).not.toBeVisible()
  })
})

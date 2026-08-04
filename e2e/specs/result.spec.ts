import { test, expect, wrap } from '../fixtures/test-base'

const history = [
  {
    id: 1,
    score: 85,
    mcScore: 85,
    totalPoints: 100,
    rankName: 'B2',
    isPassed: true,
    status: 'COMPLETED',
    startedAt: '2026-07-01T08:00:00Z',
    finishedAt: '2026-07-01T08:45:00Z',
  },
  {
    id: 2,
    score: 40,
    mcScore: 40,
    totalPoints: 100,
    rankName: 'A2',
    isPassed: false,
    status: 'PENDING_SA_GRADING',
    startedAt: '2026-07-10T08:00:00Z',
    finishedAt: '2026-07-10T08:45:00Z',
  },
]

test.describe('Result page', () => {
  test('shows summary stats and exam history for a student', async ({ page, loginAs, mockApi }) => {
    await loginAs('student')
    await mockApi('/exam/history', wrap(history))

    await page.goto('/result')

    await expect(page.getByText('Kết quả thi')).toBeVisible()
    await expect(page.getByText('Điểm trung bình')).toBeVisible()
    await expect(page.getByText('Số bài thi đã làm')).toBeVisible()
    await expect(page.getByText('Tỉ lệ đạt')).toBeVisible()

    // History rows
    await expect(page.getByText('Đạt', { exact: true })).toBeVisible()
    await expect(page.getByText('Chờ chấm điểm', { exact: true })).toBeVisible()
  })

  test('shows an empty state when the student has no exam history', async ({
    page,
    loginAs,
    mockApi,
  }) => {
    await loginAs('student')
    await mockApi('/exam/history', wrap([]))

    await page.goto('/result')

    await expect(page.getByText('Chưa có bài thi nào.')).toBeVisible()
  })
})

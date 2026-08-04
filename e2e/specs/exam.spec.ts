import { test, expect, wrap } from '../fixtures/test-base'

// The take-exam route involves a real client navigation + timer-driven proctoring
// flow; run this file's tests one at a time to avoid dev-server compile contention.
test.describe.configure({ mode: 'serial' })

const activeConfig = {
  id: 1,
  name: 'Đề chuẩn',
  examMode: 'standard',
  generalConfig: { totalMultipleChoice: 60, durationMinutes: 45 },
  status: 'published',
}

const mcOptions = (questionId: number) => [
  { id: questionId * 10 + 1, optionText: 'Đáp án A', questionId },
  { id: questionId * 10 + 2, optionText: 'Đáp án B', questionId },
]

function buildSession(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 555,
    userId: 101,
    questions: [
      { id: 1, content: 'Câu hỏi 1?', createdAt: '2026-01-01', options: mcOptions(1) },
      { id: 2, content: 'Câu hỏi 2?', createdAt: '2026-01-01', options: mcOptions(2) },
    ],
    answerIds: null,
    saQuestions: [],
    saAnswers: null,
    status: 'IN_PROGRESS',
    remainingTime: 2700,
    startedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

test.describe('Exam list page', () => {
  test('shows exam info and starts a new exam', async ({ page, loginAs, mockApi }) => {
    test.setTimeout(60_000)
    await loginAs('student')
    await mockApi('/quiz/exam-configs/active', wrap({ config: activeConfig }))
    await mockApi(
      '/exam/generate',
      wrap({ examSession: buildSession() }),
      { method: 'POST' },
    )

    await page.goto('/exam')

    await expect(page.getByRole('heading', { name: /BÀI THI ĐÁNH GIÁ/ })).toBeVisible()
    await expect(page.getByText('60 câu')).toBeVisible()
    await expect(page.getByRole('button', { name: /Bắt đầu làm bài/ })).toBeVisible()

    await page.getByRole('button', { name: /Bắt đầu làm bài/ }).click()

    await expect(page).toHaveURL(/\/exam\/555\/take/, { timeout: 45_000 })
  })

  test('shows the resume/abandon dialog when an exam is already in progress', async ({
    page,
    loginAs,
    mockApi,
  }) => {
    test.setTimeout(60_000)
    await loginAs('student')
    await mockApi('/quiz/exam-configs/active', wrap({ config: activeConfig }))
    await mockApi(
      '/exam/generate',
      { code: 400, message: 'Bạn đang có bài thi đang làm (exam in progress)', data: { examId: 555 } },
      { method: 'POST', status: 400 },
    )

    await page.goto('/exam')
    await page.getByRole('button', { name: /Bắt đầu làm bài/ }).click()

    await expect(page.locator('p.text-red-600')).toContainText('Bạn đang có bài thi chưa hoàn thành')
    await expect(page.getByRole('button', { name: 'Tiếp tục bài thi' })).toBeVisible()
    await expect(page.getByRole('button', { name: /Hủy và làm bài mới/ })).toBeVisible()
  })
})

test.describe('Take exam page', () => {
  test('allows answering questions, navigating, and submitting', async ({
    page,
    loginAs,
    mockApi,
  }) => {
    test.setTimeout(60_000)
    await loginAs('student')
    const session = buildSession()
    await mockApi('/quiz/exam-configs/active', wrap({ config: activeConfig }))
    await mockApi('/exam/generate', wrap({ examSession: session }), { method: 'POST' })
    await mockApi(
      `/exam/${session.id}/submit`,
      wrap({ result: { score: 80, totalPoints: 100, mcScore: 80, isPassed: true, hasPendingSa: false, message: 'Đạt' } }),
      { method: 'POST' },
    )
    await mockApi(`/exam/${session.id}/progress`, wrap({}), { method: 'PATCH' })

    await page.goto('/exam')
    await page.getByRole('button', { name: /Bắt đầu làm bài/ }).click()
    await expect(page).toHaveURL(/\/exam\/555\/take/, { timeout: 45_000 })

    // Answer question 1
    await expect(page.getByText('Câu hỏi 1?')).toBeVisible()
    await page.getByText('Đáp án A').click()

    // Navigate to question 2 and answer it
    await page.getByRole('button', { name: 'Câu tiếp theo' }).first().click()
    await expect(page.getByText('Câu hỏi 2?')).toBeVisible()
    await page.getByText('Đáp án B').click()

    // Submit
    await page.getByRole('button', { name: 'Nộp bài thi' }).click()
    await expect(page.getByText('Xác nhận nộp bài')).toBeVisible()
    await page.getByRole('button', { name: 'Nộp bài', exact: true }).click()

    await expect(page.getByText('Kết quả bài thi')).toBeVisible()
    await expect(
      page.getByText('Đạt', { exact: true }).first(),
    ).toBeVisible()
  })

  test('auto-submits and redirects after the 3rd proctoring violation', async ({
    page,
    loginAs,
    mockApi,
  }) => {
    test.setTimeout(60_000)
    await loginAs('student')
    const session = buildSession()
    await mockApi('/quiz/exam-configs/active', wrap({ config: activeConfig }))
    await mockApi('/exam/generate', wrap({ examSession: session }), { method: 'POST' })
    await mockApi(`/exam/${session.id}/progress`, wrap({}), { method: 'PATCH' })

    let violationCount = 0
    await page.route('**/api/v1/**', async (route) => {
      const url = new URL(route.request().url())
      if (url.pathname.includes(`/exam/${session.id}/violation`)) {
        violationCount += 1
        const autoSubmitted = violationCount >= 3
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(wrap({ violationCount, autoSubmitted })),
        })
        return
      }
      return route.fallback()
    })
    await mockApi(
      `/exam/${session.id}/submit`,
      wrap({ result: { score: 0, totalPoints: 100, mcScore: 0, isPassed: false, hasPendingSa: false, message: 'Tự động nộp do vi phạm' } }),
      { method: 'POST' },
    )

    await page.goto('/exam')
    await page.getByRole('button', { name: /Bắt đầu làm bài/ }).click()
    await expect(page).toHaveURL(/\/exam\/555\/take/, { timeout: 45_000 })

    // Trigger 3 window-blur violations
    for (let i = 0; i < 3; i += 1) {
      await page.evaluate(() => window.dispatchEvent(new Event('blur')))
      // eslint-disable-next-line playwright/no-wait-for-timeout
      await page.waitForTimeout(2100)
    }

    // Auto-submit fires -> result popup shown briefly, then auto-redirects to /result or
    // /certificate. The popup only stays mounted for ~2s before the redirect, so assert on the
    // final URL (the durable signal) rather than racing to catch the transient popup.
    await expect(page).toHaveURL(/\/(result|certificate)/, { timeout: 15_000 })
  })
})

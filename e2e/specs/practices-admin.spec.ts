import { test, expect, wrap } from '../fixtures/test-base'

const CONFIG = {
  questionCount: 10,
  questionTypes: ['mc'],
  shuffleQuestions: true,
  shuffleOptions: true,
  timeLimitMinutes: null,
  retryLimit: null,
  passingScore: 60,
  revealMode: 'after_submit',
}

function exercise(id: number, status: string, extra: Record<string, unknown> = {}) {
  return {
    id,
    title: `Bai luyen tap #${id}`,
    description: '',
    status,
    config: CONFIG,
    ...extra,
  }
}

const ALL_STATUS_EXERCISES = [
  exercise(1, 'draft'),
  exercise(2, 'pending_review'),
  exercise(3, 'rejected', { rejectionReason: 'Cau 3 thieu dap an dung' }),
  exercise(4, 'approved'),
  exercise(5, 'published'),
  exercise(6, 'inactive'),
]

test.describe('Admin exercise list', () => {
  test('renders a status badge for every lifecycle state', async ({ page, loginAs, mockApi }) => {
    await loginAs('teacher')
    await mockApi('/practice/exercises', wrap(ALL_STATUS_EXERCISES), { method: 'GET' })

    await page.goto('/practices')
    await expect(page.getByRole('heading', { name: 'Quản lý luyện tập' })).toBeVisible()

    await expect(page.getByText('Nháp')).toBeVisible()
    await expect(page.getByText('Chờ thẩm định')).toBeVisible()
    await expect(page.getByText('Bị từ chối')).toBeVisible()
    await expect(page.getByText('Đã phê duyệt')).toBeVisible()
    await expect(page.getByText('Đã xuất bản')).toBeVisible()
    await expect(page.getByText('Ngừng sử dụng')).toBeVisible()
  })

  test('creates a new exercise as a draft', async ({ page, loginAs, mockApi }) => {
    await loginAs('teacher')
    await mockApi('/practice/exercises', wrap([]), { method: 'GET' })
    await mockApi('/quiz/categories', wrap([{ id: 1, name: 'Toán' }]), { method: 'GET' })
    await mockApi(
      '/practice/exercises',
      wrap({ exercise: exercise(10, 'draft') }),
      { method: 'POST' },
    )

    await page.goto('/practices')
    await page.getByRole('button', { name: 'Tạo bài luyện tập' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByText('Tạo bài luyện tập mới')).toBeVisible()

    await page.getByLabel('Tiêu đề *').fill('Bài luyện tập mới')
    await page.getByRole('button', { name: 'Tạo (nháp)' }).click()

    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('shows the submit-for-review action only for draft/rejected exercises', async ({
    page,
    loginAs,
    mockApi,
  }) => {
    await loginAs('teacher')
    await mockApi('/practice/exercises', wrap(ALL_STATUS_EXERCISES), { method: 'GET' })
    await mockApi(/\/practice\/exercises\/1\/submit-review/, wrap({ exercise: exercise(1, 'pending_review') }), {
      method: 'PATCH',
    })

    await page.goto('/practices')
    const submitButtons = page.getByLabel('Gửi thẩm định')
    await expect(submitButtons).toHaveCount(2) // draft (#1) + rejected (#3)

    const responsePromise = page.waitForResponse((r) =>
      /\/practice\/exercises\/1\/submit-review/.test(r.url()) && r.request().method() === 'PATCH',
    )
    await submitButtons.first().click()
    await responsePromise
  })

  test('shows the publish action only for approved exercises and publishes it', async ({
    page,
    loginAs,
    mockApi,
  }) => {
    await loginAs('admin')
    await mockApi('/practice/exercises', wrap(ALL_STATUS_EXERCISES), { method: 'GET' })
    await mockApi(/\/practice\/exercises\/4\/publish/, wrap({ exercise: exercise(4, 'published') }), {
      method: 'PATCH',
    })

    await page.goto('/practices')
    const publishButton = page.getByLabel('Xuất bản')
    await expect(publishButton).toHaveCount(1)

    const responsePromise = page.waitForResponse((r) =>
      /\/practice\/exercises\/4\/publish/.test(r.url()) && r.request().method() === 'PATCH',
    )
    await publishButton.click()
    await responsePromise
  })

  test('blocks deleting a published exercise but allows deleting a draft', async ({
    page,
    loginAs,
    mockApi,
  }) => {
    await loginAs('admin')
    await mockApi('/practice/exercises', wrap(ALL_STATUS_EXERCISES), { method: 'GET' })
    await mockApi(/\/practice\/exercises\/1$/, wrap({}), { method: 'DELETE' })

    await page.goto('/practices')

    const deleteButtons = page.getByLabel('Xóa')
    // #5 is published -> disabled delete button
    await expect(deleteButtons.nth(4)).toBeDisabled()

    // #1 is draft -> can open confirm dialog and delete
    await deleteButtons.first().click()
    await expect(page.getByText('Xóa bài luyện tập')).toBeVisible()
    await page.getByRole('button', { name: 'Xóa' }).last().click()
  })
})

test.describe('Non-admin roles are redirected off /practices', () => {
  test('student visiting /practices is redirected to dashboard', async ({ page, loginAs }) => {
    await loginAs('student')
    await page.goto('/practices')
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('student visiting /practices/:id is redirected to dashboard', async ({ page, loginAs }) => {
    await loginAs('student')
    await page.goto('/practices/1')
    await expect(page).toHaveURL(/\/dashboard/)
  })
})

test.describe('Exercise detail page', () => {
  const EXERCISE_ID = 1
  const BASE_EXERCISE = exercise(EXERCISE_ID, 'draft')

  test('questions tab: lists, creates, and attaches questions from the bank', async ({
    page,
    loginAs,
    mockApi,
  }) => {
    await loginAs('teacher')
    await mockApi(new RegExp(`/practice/exercises/${EXERCISE_ID}$`), wrap({ exercise: BASE_EXERCISE }), {
      method: 'GET',
    })
    await mockApi(
      new RegExp(`/practice/exercises/${EXERCISE_ID}/questions$`),
      wrap({
        questions: [
          { id: 11, type: 'mc', content: 'Câu hỏi có sẵn', options: [{ id: 111, optionText: 'A', isCorrect: true }, { id: 112, optionText: 'B', isCorrect: false }] },
        ],
      }),
      { method: 'GET' },
    )
    await mockApi('/quiz/categories', wrap([]), { method: 'GET' })
    await mockApi('/practice/skills', wrap([]), { method: 'GET' })
    await mockApi(
      new RegExp(`/practice/exercises/${EXERCISE_ID}/questions$`),
      wrap({ question: { id: 12, type: 'mc', content: 'Câu hỏi mới', options: [] } }),
      { method: 'POST' },
    )
    await mockApi('/practice/questions/bank', wrap({
      questions: [{ id: 99, type: 'mc', content: 'Câu hỏi trong ngân hàng', options: [] }],
    }), { method: 'GET' })
    await mockApi(
      new RegExp(`/practice/exercises/${EXERCISE_ID}/questions/attach`),
      wrap({}),
      { method: 'POST' },
    )

    await page.goto(`/practices/${EXERCISE_ID}`)
    await expect(page.getByRole('heading', { name: 'Bai luyen tap #1' })).toBeVisible()
    await expect(page.getByText('Câu hỏi có sẵn')).toBeVisible()

    // Create a new question
    await page.getByRole('button', { name: 'Thêm câu hỏi' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByLabel('Nội dung câu hỏi *').fill('Câu hỏi test mới')
    await page.getByPlaceholder('Đáp án 1').fill('Đáp án A')
    await page.getByPlaceholder('Đáp án 2').fill('Đáp án B')
    await page.getByRole('button', { name: 'Đúng?' }).first().click()
    await page.getByRole('button', { name: 'Lưu' }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Attach from bank
    await page.getByRole('button', { name: 'Gắn từ ngân hàng' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByText('Câu hỏi trong ngân hàng')).toBeVisible()
    await page.getByRole('button', { name: 'Gắn vào bài' }).click()
  })

  test('rejection banner shows the reason when the exercise was rejected', async ({
    page,
    loginAs,
    mockApi,
  }) => {
    await loginAs('teacher')
    const rejected = exercise(EXERCISE_ID, 'rejected', { rejectionReason: 'Câu 3 thiếu đáp án đúng' })
    await mockApi(new RegExp(`/practice/exercises/${EXERCISE_ID}$`), wrap({ exercise: rejected }), {
      method: 'GET',
    })
    await mockApi(new RegExp(`/practice/exercises/${EXERCISE_ID}/questions$`), wrap({ questions: [] }), {
      method: 'GET',
    })

    await page.goto(`/practices/${EXERCISE_ID}`)
    await expect(page.getByText('Bài bị từ chối thẩm định')).toBeVisible()
    await expect(page.getByText('Câu 3 thiếu đáp án đúng')).toBeVisible()
  })

  test('error-report tab shows summary cards, filterable table, and exports CSV', async ({
    page,
    loginAs,
    mockApi,
  }) => {
    await loginAs('teacher')
    await mockApi(new RegExp(`/practice/exercises/${EXERCISE_ID}$`), wrap({ exercise: BASE_EXERCISE }), {
      method: 'GET',
    })
    await mockApi(new RegExp(`/practice/exercises/${EXERCISE_ID}/questions$`), wrap({ questions: [] }), {
      method: 'GET',
    })
    await mockApi('/quiz/categories', wrap([{ id: 1, name: 'Toán' }]), { method: 'GET' })
    await mockApi('/practice/skills', wrap([{ id: 1, name: 'Tính toán', categoryId: 1 }]), {
      method: 'GET',
    })
    await mockApi(
      new RegExp(`/practice/exercises/${EXERCISE_ID}/report-summary`),
      wrap({
        summary: {
          byCategory: [{ id: 1, total: 10, correct: 7 }],
          bySkill: [{ id: 1, total: 10, correct: 6 }],
        },
      }),
      { method: 'GET' },
    )
    await mockApi(
      new RegExp(`/practice/exercises/${EXERCISE_ID}/error-report$`),
      wrap({
        report: [
          { questionId: 11, content: 'Câu khó', totalAttempts: 10, incorrectAttempts: 6, errorRatePercent: 60 },
        ],
      }),
      { method: 'GET' },
    )
    await mockApi(
      new RegExp(`/practice/exercises/${EXERCISE_ID}/error-report/export`),
      wrap({ csv: 'question,error_rate\nCâu khó,60' }),
      { method: 'GET' },
    )

    await page.goto(`/practices/${EXERCISE_ID}`)
    await page.getByRole('button', { name: 'Báo cáo lỗi sai' }).click()

    await expect(page.getByText('Kết quả theo miền năng lực')).toBeVisible()
    await expect(page.getByText('7/10 đúng (70%)')).toBeVisible()
    await expect(page.getByText('Kết quả theo kỹ năng')).toBeVisible()
    await expect(page.getByText('Câu khó')).toBeVisible()
    await expect(page.getByText('60%', { exact: true })).toBeVisible()

    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Xuất CSV' }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toBe(`bao-cao-loi-sai-${EXERCISE_ID}.csv`)
  })

  test('audit log tab lists lifecycle actions including rejection reason', async ({
    page,
    loginAs,
    mockApi,
  }) => {
    await loginAs('teacher')
    await mockApi(new RegExp(`/practice/exercises/${EXERCISE_ID}$`), wrap({ exercise: BASE_EXERCISE }), {
      method: 'GET',
    })
    await mockApi(new RegExp(`/practice/exercises/${EXERCISE_ID}/questions$`), wrap({ questions: [] }), {
      method: 'GET',
    })
    await mockApi(
      /\/audit-logs/,
      wrap({
        logs: [
          { id: 1, actorId: 202, action: 'practice_exercise.create', entityType: 'practice_exercise', entityId: EXERCISE_ID, createdAt: '2026-07-01T08:00:00.000Z' },
          { id: 2, actorId: 202, action: 'practice_exercise.submit_review', entityType: 'practice_exercise', entityId: EXERCISE_ID, createdAt: '2026-07-01T09:00:00.000Z' },
          { id: 3, actorId: 203, action: 'practice_exercise.reject', entityType: 'practice_exercise', entityId: EXERCISE_ID, metadata: { reason: 'Thiếu đáp án đúng' }, createdAt: '2026-07-01T10:00:00.000Z' },
        ],
      }),
      { method: 'GET' },
    )

    await page.goto(`/practices/${EXERCISE_ID}`)
    await page.getByRole('button', { name: 'Lịch sử thao tác' }).click()

    await expect(page.getByText('Tạo bài luyện tập')).toBeVisible()
    await expect(page.getByText('Gửi thẩm định')).toBeVisible()
    await expect(page.getByText('Từ chối')).toBeVisible()
    await expect(page.getByText('Lý do: Thiếu đáp án đúng')).toBeVisible()
  })

  test('shows empty state when there are no audit log entries', async ({ page, loginAs, mockApi }) => {
    await loginAs('teacher')
    await mockApi(new RegExp(`/practice/exercises/${EXERCISE_ID}$`), wrap({ exercise: BASE_EXERCISE }), {
      method: 'GET',
    })
    await mockApi(new RegExp(`/practice/exercises/${EXERCISE_ID}/questions$`), wrap({ questions: [] }), {
      method: 'GET',
    })
    await mockApi(/\/audit-logs/, wrap({ logs: [] }), { method: 'GET' })

    await page.goto(`/practices/${EXERCISE_ID}`)
    await page.getByRole('button', { name: 'Lịch sử thao tác' }).click()
    await expect(page.getByText('Chưa có thao tác nào được ghi nhận.')).toBeVisible()
  })
})

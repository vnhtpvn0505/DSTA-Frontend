import { test, expect, wrap } from '../fixtures/test-base'

const EXERCISE = {
  id: 1,
  title: 'Ôn tập chương 1',
  description: 'Bài luyện tập cơ bản',
  status: 'published',
  config: {
    questionCount: 2,
    questionTypes: ['mc'],
    shuffleQuestions: false,
    shuffleOptions: false,
    timeLimitMinutes: null,
    retryLimit: null,
    passingScore: 60,
    revealMode: 'after_submit',
  },
}

const SAFE_QUESTIONS = [
  {
    id: 11,
    content: 'Câu 1: 1 + 1 = ?',
    hint: 'Đếm trên tay',
    options: [
      { id: 111, optionText: '1' },
      { id: 112, optionText: '2' },
    ],
  },
  {
    id: 12,
    content: 'Câu 2: 2 + 2 = ?',
    hint: null,
    options: [
      { id: 121, optionText: '3' },
      { id: 122, optionText: '4' },
    ],
  },
]

const ATTEMPT = {
  id: 501,
  exerciseId: 1,
  attemptNumber: 1,
  questions: SAFE_QUESTIONS,
  answerIds: {},
  status: 'in_progress',
  startedAt: '2026-07-01T08:00:00.000Z',
}

const RESULT = {
  id: 501,
  score: 100,
  passingScore: 60,
  isPassed: true,
  feedback: [
    { questionId: 11, isCorrect: true, selectedOptionId: 112, explanation: 'Chính xác', solution: null },
    { questionId: 12, isCorrect: true, selectedOptionId: 122, explanation: 'Chính xác', solution: null },
  ],
  breakdown: { byCategory: [], bySkill: [] },
}

test.describe('Student practice list', () => {
  test('shows assigned exercises tab by default and can start one', async ({
    page,
    loginAs,
    mockApi,
  }) => {
    await loginAs('student')
    await mockApi('/practice/assigned', wrap([EXERCISE]), { method: 'GET' })
    await mockApi(/\/practice\/exercises\/1\/start/, wrap({ attempt: ATTEMPT }), { method: 'POST' })

    await page.goto('/practice')
    await expect(page.getByRole('heading', { name: 'Luyện tập' })).toBeVisible()
    await expect(page.getByText('Ôn tập chương 1')).toBeVisible()
    await expect(page.getByText('2 câu')).toBeVisible()

    await page.getByRole('button', { name: 'Bắt đầu' }).click()
    await expect(page).toHaveURL('/practice/1/take')
  })

  test('shows empty state when no assigned exercises', async ({ page, loginAs, mockApi }) => {
    await loginAs('student')
    await mockApi('/practice/assigned', wrap([]), { method: 'GET' })

    await page.goto('/practice')
    await expect(page.getByText('Bạn chưa được giao bài luyện tập nào.')).toBeVisible()
  })

  test('navigates to the custom practice picker', async ({ page, loginAs, mockApi }) => {
    await loginAs('student')
    await mockApi('/practice/assigned', wrap([]), { method: 'GET' })

    await page.goto('/practice')
    await page.getByRole('button', { name: 'Tự chọn bài luyện tập' }).click()
    await expect(page).toHaveURL('/practice/custom')
  })

  test('history tab: completed row lets student view result and retry', async ({
    page,
    loginAs,
    mockApi,
  }) => {
    await loginAs('student')
    await mockApi('/practice/assigned', wrap([]), { method: 'GET' })
    await mockApi(
      '/practice/history',
      { code: 0, message: 'OK', data: [
        {
          id: 901,
          exerciseId: 1,
          exerciseTitle: 'Ôn tập chương 1',
          attemptNumber: 1,
          score: 100,
          status: 'completed',
          startedAt: '2026-07-01T08:00:00.000Z',
          finishedAt: '2026-07-01T08:10:00.000Z',
        },
      ] },
      { method: 'GET' },
    )
    await mockApi(/\/practice\/attempts\/901\/result/, wrap({ result: RESULT }), { method: 'GET' })
    await mockApi(/\/practice\/exercises\/1\/start/, wrap({ attempt: ATTEMPT }), { method: 'POST' })

    await page.goto('/practice')
    await page.getByRole('button', { name: 'Lịch sử' }).click()
    await expect(page.getByText('Đã hoàn thành')).toBeVisible()

    await page.getByLabel('Xem chi tiết').click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByText('Kết quả luyện tập')).toBeVisible()
    await expect(page.getByRole('dialog').getByText('100%')).toBeVisible()
    await page.getByRole('button', { name: 'Quay lại danh sách' }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    await page.getByLabel('Luyện tập lại').click()
    await expect(page).toHaveURL('/practice/1/take')
  })

  test('history tab: in-progress row lets student continue', async ({ page, loginAs, mockApi }) => {
    await loginAs('student')
    await mockApi('/practice/assigned', wrap([]), { method: 'GET' })
    await mockApi(
      '/practice/history',
      { code: 0, message: 'OK', data: [
        {
          id: 902,
          exerciseId: null,
          exerciseTitle: 'Luyện tập tự chọn',
          attemptNumber: 1,
          score: null,
          status: 'in_progress',
          startedAt: '2026-07-01T08:00:00.000Z',
          finishedAt: null,
        },
      ] },
      { method: 'GET' },
    )

    await page.goto('/practice')
    await page.getByRole('button', { name: 'Lịch sử' }).click()
    await expect(page.getByText('Đang làm')).toBeVisible()
    await page.getByRole('button', { name: 'Tiếp tục' }).click()
    await expect(page).toHaveURL('/practice/attempt/902/take')
  })
})

test.describe('Non-student roles are redirected off /practice', () => {
  test('admin visiting /practice is redirected to dashboard', async ({ page, loginAs }) => {
    await loginAs('admin')
    await page.goto('/practice')
    await expect(page).toHaveURL(/\/dashboard/)
  })
})

test.describe('Take an assigned exercise', () => {
  test('answers questions, submits, and views the result', async ({
    page,
    loginAs,
    mockApi,
  }) => {
    await loginAs('student')
    await mockApi(/\/practice\/exercises\/1\/start/, wrap({ attempt: ATTEMPT }), { method: 'POST' })
    await mockApi('/practice/assigned', wrap([EXERCISE]), { method: 'GET' })
    await mockApi(/\/practice\/attempts\/501\/progress/, wrap({}), { method: 'PATCH' })
    await mockApi(/\/practice\/attempts\/501\/submit/, wrap({ result: RESULT }), { method: 'POST' })

    await page.goto('/practice/1/take')
    await expect(page.getByText('Câu 1/2 · Đã trả lời 0')).toBeVisible()

    await page.getByRole('button', { name: '2', exact: true }).last().click()
    await page.getByRole('button', { name: 'Câu tiếp' }).click()
    await expect(page.getByText('Câu 2: 2 + 2 = ?')).toBeVisible()
    await page.getByRole('button', { name: '4' }).last().click()

    await expect(page.getByText('Đã trả lời 2')).toBeVisible()

    // All questions are answered, so this skips the confirm dialog and opens the result dialog directly.
    await page.getByRole('button', { name: 'Nộp bài' }).click()
    await expect(page.getByText('Kết quả luyện tập')).toBeVisible()
    await expect(page.getByRole('dialog').getByText('100%')).toBeVisible()

    await page.getByRole('button', { name: 'Quay lại danh sách' }).click()
    await expect(page).toHaveURL('/practice')
  })

  test('shows unanswered-questions confirm dialog before submitting when incomplete', async ({
    page,
    loginAs,
    mockApi,
  }) => {
    await loginAs('student')
    await mockApi(/\/practice\/exercises\/1\/start/, wrap({ attempt: ATTEMPT }), { method: 'POST' })
    await mockApi('/practice/assigned', wrap([EXERCISE]), { method: 'GET' })
    await mockApi(/\/practice\/attempts\/501\/progress/, wrap({}), { method: 'PATCH' })
    await mockApi(/\/practice\/attempts\/501\/submit/, wrap({ result: RESULT }), { method: 'POST' })

    await page.goto('/practice/1/take')

    // The submit button only renders on the last question.
    await page.getByRole('button', { name: 'Câu tiếp' }).click()
    await page.getByRole('button', { name: 'Nộp bài' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByText('Còn câu hỏi chưa trả lời')).toBeVisible()
    await expect(page.getByText(/Bạn còn 2 câu chưa trả lời/)).toBeVisible()

    await page.getByRole('button', { name: 'Tiếp tục làm bài' }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    await page.getByRole('button', { name: 'Nộp bài' }).click()
    await page.getByRole('dialog').getByRole('button', { name: 'Nộp bài' }).click()
    await expect(page.getByText('Kết quả luyện tập')).toBeVisible()
  })

  test('shows a hint when requested', async ({ page, loginAs, mockApi }) => {
    await loginAs('student')
    await mockApi(/\/practice\/exercises\/1\/start/, wrap({ attempt: ATTEMPT }), { method: 'POST' })
    await mockApi('/practice/assigned', wrap([EXERCISE]), { method: 'GET' })
    await mockApi(/\/practice\/attempts\/501\/progress/, wrap({}), { method: 'PATCH' })

    await page.goto('/practice/1/take')
    await page.getByRole('button', { name: 'Xem gợi ý' }).click()
    await expect(page.getByText('Đếm trên tay')).toBeVisible()
  })
})

test.describe('Resume / custom attempt take page', () => {
  const RESUME_ATTEMPT = { ...ATTEMPT, id: 902, exerciseId: null }

  test('answers and submits a resumed/custom attempt with the unanswered confirm gate', async ({
    page,
    loginAs,
    mockApi,
  }) => {
    await loginAs('student')
    await mockApi(/\/practice\/attempts\/902(?!\/)/, wrap({ attempt: RESUME_ATTEMPT }), { method: 'GET' })
    await mockApi(/\/practice\/attempts\/902\/progress/, wrap({}), { method: 'PATCH' })
    await mockApi(/\/practice\/attempts\/902\/submit/, wrap({ result: { ...RESULT, id: 902 } }), {
      method: 'POST',
    })

    await page.goto('/practice/attempt/902/take')
    await expect(page.getByText('Câu 1/2 · Đã trả lời 0')).toBeVisible()

    // The submit button only renders on the last question.
    await page.getByRole('button', { name: 'Câu tiếp' }).click()
    await page.getByRole('button', { name: 'Nộp bài' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    await page.getByRole('dialog').getByRole('button', { name: 'Nộp bài' }).click()
    await expect(page.getByText('Kết quả luyện tập')).toBeVisible()

    await page.getByRole('button', { name: 'Quay lại danh sách' }).click()
    await expect(page).toHaveURL('/practice')
  })
})

test.describe('Custom practice criteria picker', () => {
  test('generates a custom attempt from selected criteria and navigates to take it', async ({
    page,
    loginAs,
    mockApi,
  }) => {
    await loginAs('student')
    await mockApi('/quiz/categories', wrap([{ id: 1, name: 'Toán' }]), { method: 'GET' })
    await mockApi('/practice/skills', wrap([{ id: 1, name: 'Tính toán', categoryId: 1 }]), {
      method: 'GET',
    })
    await mockApi('/practice/generate', wrap({ attempt: { ...ATTEMPT, id: 777, exerciseId: null } }), {
      method: 'POST',
    })

    await page.goto('/practice/custom')
    await expect(page.getByRole('heading', { name: 'Tự chọn bài luyện tập' })).toBeVisible()

    await page.getByLabel('Miền năng lực').selectOption('1')
    await page.getByLabel('Kỹ năng').selectOption('1')
    await page.getByLabel('Số lượng câu').fill('5')
    await page.getByLabel('Điểm đạt (%)').fill('70')

    await page.getByRole('button', { name: 'Bắt đầu luyện tập' }).click()
    await expect(page).toHaveURL('/practice/attempt/777/take')
  })

  test('shows an error message when not enough matching questions exist', async ({
    page,
    loginAs,
    mockApi,
  }) => {
    await loginAs('student')
    await mockApi('/quiz/categories', wrap([]), { method: 'GET' })
    await mockApi('/practice/skills', wrap([]), { method: 'GET' })
    await mockApi(
      '/practice/generate',
      { code: 400, message: 'Not enough questions', data: null },
      { method: 'POST', status: 400 },
    )

    await page.goto('/practice/custom')
    await page.getByRole('button', { name: 'Bắt đầu luyện tập' }).click()
    await expect(
      page.getByText(/Không đủ câu hỏi phù hợp với tiêu chí đã chọn/),
    ).toBeVisible()
  })

  test('disables the start button when no question type is selected', async ({
    page,
    loginAs,
    mockApi,
  }) => {
    await loginAs('student')
    await mockApi('/quiz/categories', wrap([]), { method: 'GET' })
    await mockApi('/practice/skills', wrap([]), { method: 'GET' })

    await page.goto('/practice/custom')
    await page.getByLabel('Trắc nghiệm').uncheck()
    await expect(page.getByRole('button', { name: 'Bắt đầu luyện tập' })).toBeDisabled()
  })
})

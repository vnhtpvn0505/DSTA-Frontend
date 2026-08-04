import { test, expect, wrap } from '../fixtures/test-base'

const QUESTIONS = [
  {
    id: 1,
    type: 'mc',
    content: 'Câu hỏi trắc nghiệm mẫu',
    categoryId: 1,
    skillId: 1,
    options: [
      { id: 11, optionText: 'A', isCorrect: true },
      { id: 12, optionText: 'B', isCorrect: false },
    ],
  },
  {
    id: 2,
    type: 'sa',
    content: 'Câu hỏi tự luận mẫu',
    categoryId: null,
    skillId: null,
    options: [],
  },
]

const CATEGORIES = [{ id: 1, name: 'Toán' }]
const SKILLS = [{ id: 1, name: 'Tính toán', categoryId: 1 }]

test.describe('Question bank', () => {
  test('lists questions and shows their category/skill labels', async ({ page, loginAs, mockApi }) => {
    await loginAs('teacher')
    await mockApi('/quiz/categories', wrap(CATEGORIES), { method: 'GET' })
    await mockApi('/practice/skills', wrap(SKILLS), { method: 'GET' })
    await mockApi('/practice/questions/bank', wrap({ questions: QUESTIONS }), { method: 'GET' })

    await page.goto('/question-bank')
    await expect(page.getByRole('heading', { name: 'Ngân hàng câu hỏi' })).toBeVisible()
    await expect(page.getByText('Câu hỏi trắc nghiệm mẫu')).toBeVisible()
    await expect(page.getByText('Câu hỏi tự luận mẫu')).toBeVisible()
    await expect(page.locator('tbody').getByText('Tính toán')).toBeVisible()
  })

  test('shows empty state and lets the user search/filter', async ({ page, loginAs, mockApi }) => {
    await loginAs('teacher')
    await mockApi('/quiz/categories', wrap(CATEGORIES), { method: 'GET' })
    await mockApi('/practice/skills', wrap(SKILLS), { method: 'GET' })
    await mockApi('/practice/questions/bank', wrap({ questions: [] }), { method: 'GET' })

    await page.goto('/question-bank')
    await expect(page.getByText('Không tìm thấy câu hỏi nào.')).toBeVisible()

    await page.getByPlaceholder('Tìm theo nội dung câu hỏi...').fill('phương trình')
    // Filters are populated from the categories/skills lists.
    await page.locator('select').first().selectOption('1')
  })

  test('creates a standalone bank question', async ({ page, loginAs, mockApi }) => {
    await loginAs('teacher')
    await mockApi('/quiz/categories', wrap(CATEGORIES), { method: 'GET' })
    await mockApi('/practice/skills', wrap(SKILLS), { method: 'GET' })
    await mockApi('/practice/questions/bank', wrap({ questions: [] }), { method: 'GET' })
    await mockApi(
      '/practice/questions',
      wrap({ question: { id: 3, type: 'mc', content: 'Câu hỏi vừa tạo', options: [] } }),
      { method: 'POST' },
    )

    await page.goto('/question-bank')
    await page.getByRole('button', { name: 'Tạo câu hỏi' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByText('Thêm câu hỏi luyện tập')).toBeVisible()

    await page.getByLabel('Nội dung câu hỏi *').fill('Câu hỏi vừa tạo')
    await page.getByPlaceholder('Đáp án 1').fill('Đáp án đúng')
    await page.getByPlaceholder('Đáp án 2').fill('Đáp án sai')
    await page.getByRole('button', { name: 'Đúng?' }).first().click()

    const responsePromise = page.waitForResponse(
      (r) => r.url().includes('/practice/questions') && r.request().method() === 'POST',
    )
    await page.getByRole('button', { name: 'Lưu' }).click()
    await responsePromise
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('edits and deletes a bank question', async ({ page, loginAs, mockApi }) => {
    await loginAs('teacher')
    await mockApi('/quiz/categories', wrap(CATEGORIES), { method: 'GET' })
    await mockApi('/practice/skills', wrap(SKILLS), { method: 'GET' })
    await mockApi('/practice/questions/bank', wrap({ questions: QUESTIONS }), { method: 'GET' })
    await mockApi(/\/practice\/questions\/1$/, wrap({ question: { ...QUESTIONS[0], content: 'Nội dung đã sửa' } }), {
      method: 'PATCH',
    })
    await mockApi(/\/practice\/questions\/1$/, wrap({}), { method: 'DELETE' })

    await page.goto('/question-bank')

    await page.getByLabel('Sửa').first().click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByText('Sửa câu hỏi luyện tập')).toBeVisible()
    await page.getByLabel('Nội dung câu hỏi *').fill('Nội dung đã sửa')
    await page.getByRole('button', { name: 'Lưu' }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    await page.getByLabel('Xóa').first().click()
    await expect(page.getByText('Xóa hẳn câu hỏi này khỏi ngân hàng?')).toBeVisible()
    await page.getByRole('button', { name: 'Xóa', exact: true }).last().click()
  })
})

test.describe('Skill management (embedded in question bank)', () => {
  test('lists skills with their category', async ({ page, loginAs, mockApi }) => {
    await loginAs('teacher')
    await mockApi('/quiz/categories', wrap(CATEGORIES), { method: 'GET' })
    await mockApi('/practice/skills', wrap(SKILLS), { method: 'GET' })
    await mockApi('/practice/questions/bank', wrap({ questions: [] }), { method: 'GET' })

    await page.goto('/question-bank')
    await expect(page.getByRole('heading', { name: 'Kỹ năng' })).toBeVisible()
    await expect(page.getByText('Tính toán (Toán)')).toBeVisible()
  })

  test('shows empty state when there are no skills yet', async ({ page, loginAs, mockApi }) => {
    await loginAs('teacher')
    await mockApi('/quiz/categories', wrap(CATEGORIES), { method: 'GET' })
    await mockApi('/practice/skills', wrap([]), { method: 'GET' })
    await mockApi('/practice/questions/bank', wrap({ questions: [] }), { method: 'GET' })

    await page.goto('/question-bank')
    await expect(page.getByText('Chưa có kỹ năng nào. Tạo mới để bắt đầu.')).toBeVisible()
  })

  test('creates a new skill', async ({ page, loginAs, mockApi }) => {
    await loginAs('teacher')
    await mockApi('/quiz/categories', wrap(CATEGORIES), { method: 'GET' })
    await mockApi('/practice/skills', wrap([]), { method: 'GET' })
    await mockApi('/practice/questions/bank', wrap({ questions: [] }), { method: 'GET' })
    await mockApi('/practice/skills', wrap({ skill: { id: 2, name: 'Kỹ năng mới', categoryId: 1 } }), {
      method: 'POST',
    })

    await page.goto('/question-bank')
    await page.getByRole('button', { name: 'Tạo kỹ năng' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByLabel('Tên kỹ năng *').fill('Kỹ năng mới')

    const responsePromise = page.waitForResponse(
      (r) => r.url().includes('/practice/skills') && r.request().method() === 'POST',
    )
    await page.getByRole('button', { name: 'Lưu' }).click()
    await responsePromise
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('edits and deletes a skill', async ({ page, loginAs, mockApi }) => {
    await loginAs('teacher')
    await mockApi('/quiz/categories', wrap(CATEGORIES), { method: 'GET' })
    await mockApi('/practice/skills', wrap(SKILLS), { method: 'GET' })
    await mockApi('/practice/questions/bank', wrap({ questions: [] }), { method: 'GET' })
    await mockApi(/\/practice\/skills\/1$/, wrap({ skill: { ...SKILLS[0], name: 'Tên đã sửa' } }), {
      method: 'PATCH',
    })
    await mockApi(/\/practice\/skills\/1$/, wrap({}), { method: 'DELETE' })

    await page.goto('/question-bank')

    await page.getByLabel('Sửa kỹ năng').click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByText('Sửa kỹ năng')).toBeVisible()
    await page.getByLabel('Tên kỹ năng *').fill('Tên đã sửa')
    await page.getByRole('button', { name: 'Lưu' }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    await page.getByLabel('Xóa kỹ năng').click()
    await expect(page.getByText('Bạn có chắc muốn xóa kỹ năng này?')).toBeVisible()
    await page.getByRole('button', { name: 'Xóa', exact: true }).last().click()
  })
})

test.describe('/question-bank authorization', () => {
  test('a plain student is redirected off /question-bank', async ({ page, loginAs }) => {
    await loginAs('student')
    await page.goto('/question-bank')
    await expect(page).toHaveURL(/\/dashboard/)
  })
})

import { test, expect, wrap } from '../fixtures/test-base'

const pendingExams = [
  {
    id: 10,
    studentId: 101,
    studentName: 'Nguyen Van A',
    studentEmail: 'student01@edu.vn',
    mcScore: 60,
    saQuestionCount: 2,
    graderId: null,
    graderName: null,
    submittedAt: '2026-07-20T08:00:00Z',
    status: 'PENDING_SA_GRADING',
    saScore: null,
  },
]

const admins = [{ id: 201, name: 'Quan Tri Vien', email: 'admin01@edu.vn' }]

const gradingDetail = {
  id: 10,
  studentId: 101,
  studentName: 'Nguyen Van A',
  saItems: [
    {
      saQuestionId: 1,
      question: 'Trình bày khái niệm an toàn thông tin?',
      modelAnswer: 'Đáp án mẫu...',
      studentAnswer: 'Câu trả lời của sinh viên...',
      currentScore: null,
      maxScore: 10,
    },
  ],
  mcScore: 60,
  graderComment: null,
  totalSaPoints: 10,
}

test.describe('Grading list page', () => {
  test('lists exams pending grading for an admin', async ({ page, loginAs, mockApi }) => {
    await loginAs('admin')
    await mockApi('/exam/grading/pending', wrap(pendingExams))
    await mockApi('/exam/grading/admins', wrap(admins))

    await page.goto('/grading')

    await expect(page.getByRole('heading', { name: 'Chấm điểm tự luận' })).toBeVisible()
    await expect(page.getByText('Nguyen Van A')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Chấm điểm' })).toBeVisible()
  })

  test('redirects a student away from the admin-only grading page', async ({
    page,
    loginAs,
  }) => {
    await loginAs('student')
    await page.goto('/grading')

    await expect(page).toHaveURL('/dashboard')
  })
})

test.describe('Grading detail page', () => {
  test('allows scoring each SA question and submitting the grade', async ({
    page,
    loginAs,
    mockApi,
  }) => {
    await loginAs('admin')
    await mockApi('/exam/grading/10', wrap(gradingDetail))
    await mockApi(
      '/exam/grading/10/submit',
      wrap({ id: 10, totalScore: 68, mcScore: 60, saScore: 8, isPassed: true, rankName: 'B2' }),
      { method: 'POST' },
    )

    await page.goto('/grading/10')

    await expect(page.getByText('Chấm điểm bài thi #10')).toBeVisible()
    await expect(page.getByText('Trình bày khái niệm an toàn thông tin?')).toBeVisible()

    // Score the single SA question with 8/10
    await page.getByRole('button', { name: '8', exact: true }).click()

    await expect(page.getByRole('button', { name: 'Xác nhận chấm điểm' })).toBeEnabled()
    await page.getByRole('button', { name: 'Xác nhận chấm điểm' }).click()

    await expect(page.getByText('Chấm điểm thành công!')).toBeVisible()
  })
})

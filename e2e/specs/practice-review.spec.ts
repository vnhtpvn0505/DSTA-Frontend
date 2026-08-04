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

const PENDING_EXERCISES = [
  {
    id: 1,
    title: 'Bài chờ thẩm định #1',
    description: '',
    status: 'pending_review',
    config: CONFIG,
    submittedForReviewAt: '2026-07-01T08:00:00.000Z',
  },
  {
    id: 2,
    title: 'Bài chờ thẩm định #2',
    description: '',
    status: 'pending_review',
    config: CONFIG,
    submittedForReviewAt: '2026-07-02T08:00:00.000Z',
  },
]

test.describe('Reviewer practice-review queue', () => {
  test('lists pending-review exercises', async ({ page, loginAs, mockApi }) => {
    await loginAs('reviewer')
    await mockApi('/practice/exercises/pending-review', wrap(PENDING_EXERCISES), { method: 'GET' })

    await page.goto('/practice-review')
    await expect(page.getByRole('heading', { name: 'Thẩm định bài luyện tập' })).toBeVisible()
    await expect(page.getByText('Bài chờ thẩm định #1')).toBeVisible()
    await expect(page.getByText('Bài chờ thẩm định #2')).toBeVisible()
  })

  test('shows empty state when nothing is pending', async ({ page, loginAs, mockApi }) => {
    await loginAs('reviewer')
    await mockApi('/practice/exercises/pending-review', wrap([]), { method: 'GET' })

    await page.goto('/practice-review')
    await expect(page.getByText('Không có bài luyện tập nào đang chờ thẩm định.')).toBeVisible()
  })

  test('approves a pending exercise', async ({ page, loginAs, mockApi }) => {
    await loginAs('reviewer')
    await mockApi('/practice/exercises/pending-review', wrap(PENDING_EXERCISES), { method: 'GET' })
    await mockApi(/\/practice\/exercises\/1\/approve/, wrap({ exercise: { ...PENDING_EXERCISES[0], status: 'approved' } }), {
      method: 'PATCH',
    })

    await page.goto('/practice-review')
    const responsePromise = page.waitForResponse(
      (r) => /\/practice\/exercises\/1\/approve/.test(r.url()) && r.request().method() === 'PATCH',
    )
    await page.getByRole('button', { name: 'Phê duyệt' }).first().click()
    await responsePromise
  })

  test('rejects a pending exercise with a reason', async ({ page, loginAs, mockApi }) => {
    await loginAs('reviewer')
    await mockApi('/practice/exercises/pending-review', wrap(PENDING_EXERCISES), { method: 'GET' })
    await mockApi(
      /\/practice\/exercises\/1\/reject/,
      wrap({ exercise: { ...PENDING_EXERCISES[0], status: 'rejected', rejectionReason: 'Câu 3 thiếu đáp án đúng, cần bổ sung.' } }),
      { method: 'PATCH' },
    )

    await page.goto('/practice-review')
    await page.getByRole('button', { name: 'Từ chối' }).first().click()
    await expect(page.getByText('Từ chối "Bài chờ thẩm định #1"')).toBeVisible()

    // Confirm button is disabled until a reason is entered
    await expect(page.getByRole('button', { name: 'Từ chối', exact: true }).last()).toBeDisabled()

    await page.getByPlaceholder('Vd: Câu 3 thiếu đáp án đúng, cần bổ sung.').fill('Câu 3 thiếu đáp án đúng, cần bổ sung.')
    await expect(page.getByRole('button', { name: 'Từ chối', exact: true }).last()).toBeEnabled()

    const responsePromise = page.waitForResponse(
      (r) => /\/practice\/exercises\/1\/reject/.test(r.url()) && r.request().method() === 'PATCH',
    )
    await page.getByRole('button', { name: 'Từ chối', exact: true }).last().click()
    await responsePromise
  })

  test('cancelling the reject dialog closes it without submitting', async ({ page, loginAs, mockApi }) => {
    await loginAs('reviewer')
    await mockApi('/practice/exercises/pending-review', wrap(PENDING_EXERCISES), { method: 'GET' })

    await page.goto('/practice-review')
    await page.getByRole('button', { name: 'Từ chối' }).first().click()
    await expect(page.getByText('Nhập lý do từ chối để giảng viên chỉnh sửa lại.')).toBeVisible()
    await page.getByRole('button', { name: 'Hủy' }).click()
    await expect(page.getByText('Nhập lý do từ chối để giảng viên chỉnh sửa lại.')).not.toBeVisible()
  })
})

test.describe('/practice-review authorization', () => {
  test('a plain student is redirected off /practice-review', async ({ page, loginAs }) => {
    await loginAs('student')
    await page.goto('/practice-review')
    await expect(page).toHaveURL(/\/dashboard/)
  })

  // NOTE (real app gap, not a test bug): the page guards access with
  // `RoleGuard allowedRoles={['admin']}` only (see
  // src/app/(protected)/practice-review/page.tsx) — there is no client-side
  // check of `user.adminType === 'reviewer'`. So a plain admin or a teacher
  // (both have role 'admin', just different adminType) currently reach the
  // reviewer queue and can approve/reject exercises, even though the
  // 2-tier workflow intends only Reviewers to do that. These two tests
  // document the CURRENT (over-permissive) behavior; they should be
  // tightened to assert a redirect once the app adds the adminType check.
  test('a plain admin (no reviewer adminType) can currently still reach /practice-review', async ({
    page,
    loginAs,
    mockApi,
  }) => {
    await loginAs('admin')
    await mockApi('/practice/exercises/pending-review', wrap([]), { method: 'GET' })
    await page.goto('/practice-review')
    await expect(page).toHaveURL('/practice-review')
    await expect(page.getByRole('heading', { name: 'Thẩm định bài luyện tập' })).toBeVisible()
  })

  test('a teacher can currently still reach /practice-review', async ({ page, loginAs, mockApi }) => {
    await loginAs('teacher')
    await mockApi('/practice/exercises/pending-review', wrap([]), { method: 'GET' })
    await page.goto('/practice-review')
    await expect(page).toHaveURL('/practice-review')
    await expect(page.getByRole('heading', { name: 'Thẩm định bài luyện tập' })).toBeVisible()
  })
})

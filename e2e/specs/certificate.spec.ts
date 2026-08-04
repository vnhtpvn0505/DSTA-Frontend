import { test, expect, wrap } from '../fixtures/test-base'

const certificates = [
  {
    id: 1,
    rankName: 'B2',
    score: 85,
    issuedAt: '2026-07-01T08:45:00Z',
    userExamId: 1,
    testId: 1,
  },
]

test.describe('Certificate page', () => {
  test('lists certificates for a student who has completed an exam', async ({
    page,
    loginAs,
    mockApi,
  }) => {
    await loginAs('student')
    await mockApi('/user/certificates', wrap(certificates))

    await page.goto('/certificate')

    await expect(page.getByText('Chứng chỉ của tôi')).toBeVisible()
    await expect(page.getByText('CHỨNG NHẬN NĂNG LỰC SỐ')).toBeVisible()
    await expect(page.getByText('B2', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Tải PDF' })).toBeVisible()
  })

  test('shows an empty state when the student has no certificates', async ({
    page,
    loginAs,
    mockApi,
  }) => {
    await loginAs('student')
    await mockApi('/user/certificates', wrap([]))

    await page.goto('/certificate')

    await expect(page.getByText('Chưa có chứng chỉ nào.')).toBeVisible()
  })
})

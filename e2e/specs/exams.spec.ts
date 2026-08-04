import { test, expect, wrap } from '../fixtures/test-base'

const examConfigs = [
  {
    id: 1,
    name: 'Đề nháp',
    examMode: 'standard',
    generalConfig: { totalMultipleChoice: 60, durationMinutes: 45 },
    status: 'draft',
  },
  {
    id: 2,
    name: 'Đề đã xuất bản',
    examMode: 'standard',
    generalConfig: { totalMultipleChoice: 60, durationMinutes: 45 },
    status: 'published',
  },
]

test.describe('Exams (exam config lifecycle) admin page', () => {
  test.beforeEach(async ({ loginAs, mockApi }) => {
    await loginAs('admin')
    await mockApi('/quiz/categories', wrap([]))
    await mockApi(/\/quiz\/questions(\?|$)/, wrap({ items: [], total: 0, totalPages: 1 }))
    await mockApi('/quiz/exam-configs', wrap({ configs: examConfigs }), { method: 'GET' })
  })

  test('lists exam configs with a draft and a published config', async ({ page }) => {
    await page.goto('/exams')

    await expect(page.getByText('Quản lí bài thi')).toBeVisible()
    await page.getByRole('button', { name: 'Cấu trúc đề thi' }).click()

    await expect(page.getByText('Đề nháp')).toBeVisible()
    await expect(page.getByText('Đề đã xuất bản')).toBeVisible()
    await expect(page.getByText('Nháp', { exact: true })).toBeVisible()
    await expect(page.getByText('Đã xuất bản', { exact: true })).toBeVisible()
  })

  test('publishes a draft config', async ({ page, mockApi }) => {
    await mockApi('/quiz/exam-configs/1/publish', wrap({ ...examConfigs[0], status: 'published' }), {
      method: 'PATCH',
    })

    await page.goto('/exams')
    await page.getByRole('button', { name: 'Cấu trúc đề thi' }).click()
    await expect(page.getByText('Đề nháp')).toBeVisible()

    const draftRow = page.getByRole('row', { name: /Đề nháp/ })
    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/quiz/exam-configs/1/publish')),
      draftRow.getByRole('button', { name: 'Xuất bản' }).click(),
    ])
    expect(response.status()).toBe(200)
  })

  test('duplicates a config', async ({ page, mockApi }) => {
    await mockApi('/quiz/exam-configs/1/duplicate', wrap({ ...examConfigs[0], id: 3, name: 'Đề nháp (copy)' }), {
      method: 'POST',
    })

    await page.goto('/exams')
    await page.getByRole('button', { name: 'Cấu trúc đề thi' }).click()
    await expect(page.getByText('Đề nháp')).toBeVisible()

    const draftRow = page.getByRole('row', { name: /Đề nháp/ })
    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/quiz/exam-configs/1/duplicate')),
      draftRow.getByRole('button', { name: 'Sao chép' }).click(),
    ])
    expect(response.status()).toBe(200)
  })

  test('disables delete for a published config', async ({ page }) => {
    await page.goto('/exams')
    await page.getByRole('button', { name: 'Cấu trúc đề thi' }).click()
    await expect(page.getByText('Đề đã xuất bản')).toBeVisible()

    const publishedRow = page.getByRole('row', { name: /Đề đã xuất bản/ })
    await expect(publishedRow.getByRole('button', { name: 'Xóa' })).toBeDisabled()
    // Published configs can't be re-published (send/publish action hidden) but can be deactivated
    await expect(publishedRow.getByRole('button', { name: 'Xuất bản', exact: true })).toHaveCount(0)
    await expect(publishedRow.getByRole('button', { name: 'Ngừng sử dụng' })).toBeVisible()
  })
})

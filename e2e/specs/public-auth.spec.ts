import { test, expect } from '../fixtures/test-base'

// The /register page currently has no registration form implemented — it
// immediately redirects to the login page ("/"). This spec documents that
// actual behavior. Login itself is already covered in auth.spec.ts.
test.describe('Register page', () => {
  test('redirects to the login page (registration form not yet implemented)', async ({ page }) => {
    await page.goto('/register')

    await expect(page).toHaveURL('/')
  })
})

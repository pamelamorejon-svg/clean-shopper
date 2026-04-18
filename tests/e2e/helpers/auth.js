import { expect } from '@playwright/test'

/**
 * Credentials for the shared test account.
 * Override with environment variables in CI:
 *   PLAYWRIGHT_TEST_EMAIL and PLAYWRIGHT_TEST_PASSWORD
 *
 * The account must exist in Supabase and have email confirmation disabled
 * (or already confirmed) so sign-in succeeds immediately.
 */
export const TEST_EMAIL = process.env.PLAYWRIGHT_TEST_EMAIL ?? 'playwright@cleanshoppertest.dev'
export const TEST_PASSWORD = process.env.PLAYWRIGHT_TEST_PASSWORD ?? 'playwright123'

/**
 * Signs in and waits until the browse page is visible.
 * Call this at the start of any test that requires an authenticated session.
 */
export async function signIn(page) {
  await page.goto('/')
  await page.getByLabel('Email').fill(TEST_EMAIL)
  await page.getByLabel('Password').fill(TEST_PASSWORD)
  await page.getByRole('button', { name: /sign in/i }).click()
  await expect(page.getByRole('heading', { name: 'Shop Clean' })).toBeVisible({ timeout: 10000 })
}

/**
 * Opens the search overlay, types a query, and submits it.
 * Waits for the Search Products page to appear with results.
 */
export async function search(page, query) {
  await page.getByRole('button', { name: 'Search', exact: true }).click()
  const input = page.getByPlaceholder('Search for a product or keyword…')
  await expect(input).toBeVisible()
  await input.fill(query)
  await input.press('Enter')
  await expect(page.getByRole('heading', { name: 'Search Products' })).toBeVisible({ timeout: 10000 })
}

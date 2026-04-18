import { test, expect } from '@playwright/test'

// ─── Smoke Tests ──────────────────────────────────────────────────────────────
// Basic checks that the app loads and core surfaces are reachable.
// These tests do not require a signed-in user.

test('loads the sign-in page', async ({ page }) => {
  await page.goto('/')
  // Title is set in index.html
  await expect(page).toHaveTitle('Clean Shopper')
  // Sign-in form is visible — the subtitle "Sign in to your account" is a <p>, not a heading
  await expect(page.getByText('Sign in to your account')).toBeVisible()
})

test('shows sign-up link on sign-in page', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText(/sign up/i)).toBeVisible()
})

test('navigates to sign-up view', async ({ page }) => {
  await page.goto('/')
  await page.getByText(/sign up/i).first().click()
  // Sign-up subtitle is a <p>, not a heading element
  await expect(page.getByText('Create your account')).toBeVisible()
})

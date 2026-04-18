import { test, expect } from '@playwright/test'

/**
 * Auth flow test — full sign-up → sign-out → sign-in cycle.
 *
 * PREREQUISITE: Disable "Confirm email" in your Supabase project so that
 * new accounts are signed in automatically without an email confirmation step.
 * Supabase dashboard → Authentication → Providers → Email → toggle off
 * "Confirm email". Without this, sign-up will show a "Check your email"
 * message and the user will NOT land on the browse page automatically.
 *
 * Tests run serially (test.describe.serial) because each step builds on
 * the previous one — they share a single test account created in step 3.
 */

// One unique email for the whole suite — safe because tests run serially
const TEST_EMAIL = `test+${Date.now()}@cleanshoppertest.dev`
const TEST_PASSWORD = 'testpassword123'

test.describe.serial('Authentication flow', () => {

  // ── Step 1: Sign-in page loads ──────────────────────────────────────────────

  test('step 1 — sign-in page loads', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByText('Clean Shopper').first()).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })

  // ── Step 2: Navigate to sign-up ─────────────────────────────────────────────

  test('step 2 — navigate to sign-up', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: /sign up/i }).click()

    await expect(page.getByText('Create your account')).toBeVisible()
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible()
  })

  // ── Steps 3–4: Create account and land on browse page ───────────────────────

  test('steps 3–4 — sign up and land on browse page', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: /sign up/i }).click()
    await expect(page.getByText('Create your account')).toBeVisible()

    await page.getByLabel('Email').fill(TEST_EMAIL)
    await page.getByLabel('Password').fill(TEST_PASSWORD)
    await page.getByRole('button', { name: /create account/i }).click()

    // Lands on browse page after successful sign-up (email confirmation must be off)
    await expect(page.getByRole('heading', { name: 'Shop Clean' })).toBeVisible({ timeout: 10000 })

    // NavBar is present with expected tabs (exact: true avoids matching product card buttons)
    await expect(page.getByRole('button', { name: 'Saved', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Cart', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign out', exact: true })).toBeVisible()
  })

  // ── Step 5: Sign out and return to sign-in ──────────────────────────────────

  test('step 5 — sign out returns to sign-in page', async ({ page }) => {
    await page.goto('/')

    // Sign in using the account created in steps 3–4
    await page.getByLabel('Email').fill(TEST_EMAIL)
    await page.getByLabel('Password').fill(TEST_PASSWORD)
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page.getByRole('heading', { name: 'Shop Clean' })).toBeVisible({ timeout: 10000 })

    // Sign out
    await page.getByRole('button', { name: 'Sign out', exact: true }).click()

    // Back on sign-in page
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Shop Clean' })).not.toBeVisible()
  })

  // ── Steps 6–7: Sign in and land on browse page ──────────────────────────────

  test('steps 6–7 — sign in with existing credentials and land on browse page', async ({ page }) => {
    await page.goto('/')

    // Should be on sign-in page
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()

    // Sign in with the account created in steps 3–4
    await page.getByLabel('Email').fill(TEST_EMAIL)
    await page.getByLabel('Password').fill(TEST_PASSWORD)
    await page.getByRole('button', { name: /sign in/i }).click()

    // Lands on browse page
    await expect(page.getByRole('heading', { name: 'Shop Clean' })).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('button', { name: 'Sign out', exact: true })).toBeVisible()
  })

})

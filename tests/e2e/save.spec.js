import { test, expect } from '@playwright/test'
import { signIn, search } from './helpers/auth.js'

/**
 * Save to list tests.
 *
 * REQUIRES: Products in the Supabase database whose name, brand, or summary
 * contains the search term below, and at least one product that is not already
 * saved by the Playwright test account. If all results show "Saved" from
 * previous runs, clear saved products via the app's Saved page before re-running.
 */

const SEARCH_TERM = 'clean'

test.describe('Save to list', () => {

  test('saving a product changes the button to Saved and persists after a page refresh', async ({ page }) => {
    // ── Sign in and search ─────────────────────────────────────────────────────
    await signIn(page)
    await search(page, SEARCH_TERM)
    await expect(page.getByRole('heading', { level: 3 }).first()).toBeVisible({ timeout: 10000 })

    // ── Find the first product that is not yet saved ───────────────────────────
    // Targeting a "Save" button (not "Saved") guarantees a known unsaved state.
    const firstSaveButton = page.getByRole('button', { name: 'Save', exact: true }).first()
    await expect(firstSaveButton).toBeVisible({ timeout: 5000 })

    // ── Capture the product name as a plain string ────────────────────────────
    // We read this BEFORE clicking so the locator is still in its original state.
    // productName is a stable string we use for all post-click lookups.
    const productName = await firstSaveButton
      .locator('xpath=ancestor::div[contains(@class,"rounded-radius-lg")]')
      .first()
      .getByRole('heading', { level: 3 })
      .first()
      .textContent()

    // ── Click Save ────────────────────────────────────────────────────────────
    await page.getByRole('button', { name: 'Save', exact: true }).first().click()

    // ── Verify the button changed to Saved ────────────────────────────────────
    // Re-locate the card by heading text (stable after the state change).
    const savedCard = page
      .getByRole('heading', { level: 3, name: productName, exact: true })
      .first()
      .locator('xpath=ancestor::div[contains(@class,"rounded-radius-lg")]')
      .first()

    await expect(
      savedCard.getByRole('button', { name: 'Saved', exact: true })
    ).toBeVisible({ timeout: 5000 })

    // Wait for the Supabase insert to finish before navigating away.
    // Without this pause the reload can cancel the in-flight request,
    // causing the save to never reach the database.
    await page.waitForTimeout(1500)

    // ── Reload the page ───────────────────────────────────────────────────────
    await page.reload()

    // Supabase stores the session in localStorage — user stays signed in.
    // After reload the app renders the browse page by default.
    await expect(page.getByRole('heading', { name: 'Shop Clean' })).toBeVisible({ timeout: 10000 })

    // ── Search again for the same product ─────────────────────────────────────
    await search(page, SEARCH_TERM)
    await expect(page.getByRole('heading', { level: 3 }).first()).toBeVisible({ timeout: 10000 })

    // ── Verify the same product still shows Saved ─────────────────────────────
    const reloadedCard = page
      .getByRole('heading', { level: 3, name: productName, exact: true })
      .first()
      .locator('xpath=ancestor::div[contains(@class,"rounded-radius-lg")]')
      .first()

    await expect(
      reloadedCard.getByRole('button', { name: 'Saved', exact: true })
    ).toBeVisible({ timeout: 5000 })
  })

})

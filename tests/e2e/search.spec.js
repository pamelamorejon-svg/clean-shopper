import { test, expect } from '@playwright/test'
import { signIn, search } from './helpers/auth.js'

/**
 * Search flow tests.
 *
 * REQUIRES: Products in the Supabase database whose name, brand, or summary
 * contains the search term below. Update SEARCH_TERM if your products use
 * different naming.
 */

const SEARCH_TERM = 'clean'

test.describe('Search', () => {

  test('search for a product and verify results appear with name and safety rating', async ({ page }) => {
    // ── Sign in ────────────────────────────────────────────────────────────────
    await signIn(page)

    // ── Open search overlay and submit query ───────────────────────────────────
    await search(page, SEARCH_TERM)

    // ── Results count line is visible ─────────────────────────────────────────
    // e.g. '4 results for "clean"'
    await expect(
      page.getByText(new RegExp(`results? for`, 'i'))
    ).toBeVisible({ timeout: 10000 })

    // ── At least one product appeared ─────────────────────────────────────────
    const productNames = page.getByRole('heading', { level: 3 })
    const resultCount = await productNames.count()
    expect(resultCount).toBeGreaterThan(0)

    // ── Every result shows a product name ─────────────────────────────────────
    for (let i = 0; i < resultCount; i++) {
      await expect(productNames.nth(i)).toBeVisible()
    }

    // ── Every result shows a safety rating badge ───────────────────────────────
    // SafetyBadge renders as: Clean | Mixed | Caution
    // Note: the ingredient hover overlay on each card also contains hidden
    // SafetyBadge spans, so total badge count exceeds resultCount. We assert
    // >= resultCount (at least one badge per result) rather than exact equality.
    const badges = page.getByText(/^(Clean|Mixed|Caution)$/)
    const badgeCount = await badges.count()
    expect(badgeCount).toBeGreaterThanOrEqual(resultCount)
    await expect(badges.first()).toBeVisible()
  })

})

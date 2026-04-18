import { test, expect } from '@playwright/test'
import { signIn } from './helpers/auth.js'

/**
 * Browse grid and category filter tests.
 *
 * REQUIRES: Products in the Supabase database spanning at least two different
 * categories so the filter can meaningfully change what's shown.
 */

test.describe('Browse', () => {

  test('products load in the browse grid', async ({ page }) => {
    await signIn(page)

    // Browse page is the default view after sign-in
    await expect(page.getByRole('heading', { name: 'Shop Clean' })).toBeVisible()

    // At least one product card loads (identified by its h3 product name heading)
    await expect(page.getByRole('heading', { level: 3 }).first()).toBeVisible({ timeout: 10000 })
  })

  test('clicking a category filter updates the grid', async ({ page }) => {
    await signIn(page)

    // Wait for initial product grid to populate
    await expect(page.getByRole('heading', { level: 3 }).first()).toBeVisible({ timeout: 10000 })
    const allCount = await page.getByRole('heading', { level: 3 }).count()

    // ── Click a category filter ────────────────────────────────────────────────
    // Category filters are <span> elements in the filter row.
    // .first() targets the filter chip, not the CategoryTag inside a product card.
    await page.getByText('Personal Care').first().click()

    // Grid still shows products after filtering
    await expect(page.getByRole('heading', { level: 3 }).first()).toBeVisible({ timeout: 5000 })
    const filteredCount = await page.getByRole('heading', { level: 3 }).count()
    expect(filteredCount).toBeGreaterThan(0)

    // All visible category tags on product cards should say "Personal Care".
    // CategoryTag renders as a <span> — count them: filter chip (1) + one per card.
    const personalCareLabels = page.getByText('Personal Care', { exact: true })
    const labelCount = await personalCareLabels.count()
    // Subtract 1 for the filter chip itself; the rest are product card tags
    expect(labelCount - 1).toBe(filteredCount)

    // ── Reset to All ──────────────────────────────────────────────────────────
    await page.getByText('All', { exact: true }).first().click()

    await expect(page.getByRole('heading', { level: 3 }).first()).toBeVisible({ timeout: 5000 })
    const resetCount = await page.getByRole('heading', { level: 3 }).count()
    expect(resetCount).toBe(allCount)
  })

})

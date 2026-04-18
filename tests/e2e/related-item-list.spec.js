import { test, expect } from '@playwright/test'
import { signIn } from './helpers/auth.js'

/**
 * Related Item List tests.
 *
 * Verifies acceptance criteria from /docs/feature-spec-related-item-list.md.
 *
 * REQUIRES: Products in the Supabase database, with at least one category
 * ("Personal Care") containing more than one product so related items appear.
 */

// ── Helper: sign in, click first product card, enter detail view ───────────────
async function openFirstProductDetail(page) {
  await signIn(page)
  await expect(page.getByRole('heading', { level: 3 }).first()).toBeVisible({ timeout: 10000 })
  const firstHeading = page.getByRole('heading', { level: 3 }).first()
  const productName = await firstHeading.textContent()
  await firstHeading.click()
  // Breadcrumb confirms detail view is active
  await expect(page.getByRole('button', { name: 'Browse Products' })).toBeVisible({ timeout: 5000 })
  return productName
}

// ── Helper: sign in, filter by Personal Care, click first product ──────────────
// Personal Care is confirmed to have multiple products (browse.spec.js), so
// there will be at least one related item in the list.
async function openPersonalCareProductDetail(page) {
  await signIn(page)
  await expect(page.getByRole('heading', { level: 3 }).first()).toBeVisible({ timeout: 10000 })
  await page.getByText('Personal Care').first().click()
  await expect(page.getByRole('heading', { level: 3 }).first()).toBeVisible({ timeout: 5000 })
  const firstHeading = page.getByRole('heading', { level: 3 }).first()
  const productName = await firstHeading.textContent()
  await firstHeading.click()
  await expect(page.getByRole('button', { name: 'Browse Products' })).toBeVisible({ timeout: 5000 })
  return productName
}

// ── Helper: wait for the related list loading skeletons to resolve ─────────────
async function waitForRelatedListLoaded(page) {
  // The h2 heading renders immediately (spec: no layout shift during loading).
  // We then wait briefly for the Supabase fetch to resolve the skeleton cards.
  await expect(page.getByRole('heading', { level: 2 })).toBeVisible({ timeout: 10000 })
  await page.waitForTimeout(2000)
}

// ─────────────────────────────────────────────────────────────────────────────
test.describe('Related Item List', () => {

  // ── Rendering ────────────────────────────────────────────────────────────────

  test('clicking a product card enters the detail view and shows a breadcrumb', async ({ page }) => {
    await openFirstProductDetail(page)
    await expect(page.getByRole('button', { name: 'Browse Products' })).toBeVisible()
  })

  test('section heading reads "Related Products in [category]"', async ({ page }) => {
    await openFirstProductDetail(page)

    const h2 = page.getByRole('heading', { level: 2 })
    await expect(h2).toBeVisible({ timeout: 10000 })
    await expect(h2).toContainText('Related Products in')
  })

  test('section heading is visible immediately — before cards load (no layout shift)', async ({ page }) => {
    await signIn(page)
    await expect(page.getByRole('heading', { level: 3 }).first()).toBeVisible({ timeout: 10000 })
    await page.getByRole('heading', { level: 3 }).first().click()

    // h2 must be visible right away — do NOT wait for cards first
    await expect(page.getByRole('heading', { level: 2 })).toBeVisible({ timeout: 5000 })
  })

  test('selected product does not appear in its own related list', async ({ page }) => {
    const productName = await openPersonalCareProductDetail(page)
    await waitForRelatedListLoaded(page)

    // The selected product renders once in the detail card above the related list.
    // The API uses excludeProductId so it must not appear again below.
    const matchingHeadings = page.getByRole('heading', { level: 3, name: productName, exact: true })
    await expect(matchingHeadings).toHaveCount(1)
  })

  test('at most 4 related products are shown', async ({ page }) => {
    await openPersonalCareProductDetail(page)
    await waitForRelatedListLoaded(page)

    const allH3 = page.getByRole('heading', { level: 3 })
    const total = await allH3.count()

    // 1 h3 for the detail card + 0–4 h3s from related cards = 1–5 total
    expect(total).toBeGreaterThanOrEqual(1)
    expect(total).toBeLessThanOrEqual(5)
  })

  // ── Loading state ─────────────────────────────────────────────────────────────

  test('while data is fetching 4 skeleton cards are rendered', async ({ page }) => {
    await signIn(page)
    await expect(page.getByRole('heading', { level: 3 }).first()).toBeVisible({ timeout: 10000 })
    await page.getByRole('heading', { level: 3 }).first().click()
    await expect(page.getByRole('button', { name: 'Browse Products' })).toBeVisible({ timeout: 5000 })

    // Check for skeleton blocks immediately (before Supabase fetch resolves).
    // Skeletons are pulse-animated divs that don't carry text or ARIA roles,
    // so we count them by their shared CSS class.
    const skeletons = page.locator('.animate-pulse')
    // The related list renders 4 skeletons during loading; the detail card above
    // may also render skeleton children so we check >= 4 not exactly 4.
    await expect(skeletons.first()).toBeVisible({ timeout: 5000 })
    const count = await skeletons.count()
    expect(count).toBeGreaterThanOrEqual(4)
  })

  // ── Empty state ───────────────────────────────────────────────────────────────

  test('empty state shows when no related products exist and hides the See-all button', async ({ page }) => {
    await openFirstProductDetail(page)
    await waitForRelatedListLoaded(page)

    const seeAllButtons = page.getByRole('button', { name: /^See all in/ })
    const relatedH3s = page.getByRole('heading', { level: 3 })
    const totalH3 = await relatedH3s.count()
    const hasRelatedProducts = totalH3 > 1  // more than just the detail card

    if (!hasRelatedProducts) {
      // Empty state must render the EmptyState component text
      await expect(page.getByText('No similar products found')).toBeVisible()
      await expect(page.getByText("We haven't assessed other products in this category yet.")).toBeVisible()
      // See-all button must be hidden in empty state
      await expect(seeAllButtons).toHaveCount(0)
    } else {
      // Non-empty path — See-all button should be present
      await expect(seeAllButtons.first()).toBeVisible()
    }
  })

  // ── Actions ───────────────────────────────────────────────────────────────────

  test('related product cards have Save and Add to Cart buttons', async ({ page }) => {
    await openPersonalCareProductDetail(page)
    await waitForRelatedListLoaded(page)

    // If related products exist, their cards must expose Save/Saved and Add to Cart.
    // Detail card = 1 Save + 1 Add to Cart. Related cards add more of each.
    const saveButtons = page.getByRole('button', { name: /^Sav(e|ed)$/ })
    const cartButtons = page.getByRole('button', { name: 'Add to Cart', exact: true })

    const saveCount = await saveButtons.count()
    const cartCount = await cartButtons.count()

    const totalH3 = await page.getByRole('heading', { level: 3 }).count()
    const hasRelatedProducts = totalH3 > 1

    if (hasRelatedProducts) {
      // Related cards contribute additional Save and Add to Cart buttons
      expect(saveCount).toBeGreaterThan(1)
      expect(cartCount).toBeGreaterThan(1)
    } else {
      // Even in the empty state, the detail card still has its buttons
      expect(saveCount).toBeGreaterThanOrEqual(1)
      expect(cartCount).toBeGreaterThanOrEqual(1)
    }
  })

  test('"See all in [Category]" button appears only when related products exist', async ({ page }) => {
    await openPersonalCareProductDetail(page)
    await waitForRelatedListLoaded(page)

    const totalH3 = await page.getByRole('heading', { level: 3 }).count()
    const hasRelatedProducts = totalH3 > 1
    const seeAllButton = page.getByRole('button', { name: /^See all in/ })

    if (hasRelatedProducts) {
      await expect(seeAllButton).toBeVisible()
    } else {
      await expect(seeAllButton).toHaveCount(0)
    }
  })

  test('"See all in [Category]" navigates back to the browse grid filtered by category', async ({ page }) => {
    await openPersonalCareProductDetail(page)
    await waitForRelatedListLoaded(page)

    const h2 = page.getByRole('heading', { level: 2 })
    const headingText = await h2.textContent()
    const category = headingText.replace('Related Products in ', '').trim()

    const seeAllButton = page.getByRole('button', { name: `See all in ${category}`, exact: true })
    await expect(seeAllButton).toBeVisible({ timeout: 5000 })

    await seeAllButton.click()

    // Returns to the browse grid (h1 re-appears)
    await expect(page.getByRole('heading', { name: 'Shop Clean' })).toBeVisible({ timeout: 5000 })

    // The active category filter chip now matches the category
    // Category filter chips are <span> elements in the filter row
    const activeChip = page.locator('span').filter({ hasText: new RegExp(`^${category}$`) }).first()
    await expect(activeChip).toBeVisible()
  })

  // ── Navigation ────────────────────────────────────────────────────────────────

  test('"Browse Products" breadcrumb link returns to the browse grid', async ({ page }) => {
    await openFirstProductDetail(page)

    await page.getByRole('button', { name: 'Browse Products' }).click()

    await expect(page.getByRole('heading', { name: 'Shop Clean' })).toBeVisible({ timeout: 5000 })
  })

})

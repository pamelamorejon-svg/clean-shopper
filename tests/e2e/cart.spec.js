import { test, expect } from '@playwright/test'
import { signIn } from './helpers/auth.js'

/**
 * Cart Page tests.
 *
 * Verifies acceptance criteria from /docs/feature-spec-cart-page.md.
 *
 * Tests run serially to avoid parallel mutations to the shared test user's
 * cart_items table. global-setup.js clears cart_items before the entire suite.
 * beforeEach ensures a clean cart at the start of every individual test.
 *
 * REQUIRES: Products in the Supabase database so "Add to Cart" can be exercised.
 */

// ── Helpers ───────────────────────────────────────────────────────────────────

// Click the Cart tab in the NavBar and wait for the page to appear.
// Uses /^Cart/ to match both "Cart" (empty) and "Cart N" (badge visible).
async function goToCart(page) {
  await page.locator('nav').getByRole('button', { name: /^Cart/ }).click()
  await expect(page.getByRole('heading', { name: 'Your Cart' })).toBeVisible({ timeout: 5000 })
}

// Add the first product in the browse grid to the cart, return its name.
// Assumes beforeEach has already signed in and left the page on the Browse grid.
async function addFirstProductToCart(page) {
  await expect(page.getByRole('heading', { level: 3 }).first()).toBeVisible({ timeout: 10000 })
  const productName = (await page.getByRole('heading', { level: 3 }).first().textContent()).trim()
  await page.getByRole('button', { name: 'Add to Cart', exact: true }).first().click()
  await page.waitForTimeout(500) // let optimistic badge update settle
  return productName
}

// The Cart tab button's badge <span> (only rendered when cartCount > 0).
// Scoped to <nav> so it never collides with "Add to Cart" buttons on product cards.
const cartBadge = (page) =>
  page.locator('nav').getByRole('button').filter({ hasText: /^Cart/ }).locator('span')

// ── Serial describe — tests share a single test-user cart ─────────────────────

test.describe.serial('Cart Page', () => {

  // Reset cart before every test so each one starts from a known state.
  test.beforeEach(async ({ page }) => {
    await signIn(page)
    await goToCart(page)

    // Wait for loading to finish (skeletons → real list or empty state)
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 8000 })

    // Clear any items left over from a previous test
    const clearBtn = page.getByRole('button', { name: 'Clear all', exact: true })
    if (await clearBtn.isVisible()) {
      await clearBtn.click()
      await expect(page.getByText('Your cart is empty')).toBeVisible({ timeout: 5000 })
      // Wait for the Supabase DELETE to commit before navigating away — the
      // optimistic update shows empty state instantly but the network write
      // is still in-flight. The next test navigates to Cart and fetches fresh
      // from Supabase; without this pause it races the DELETE.
      await page.waitForTimeout(1500)
    }

    // Return to the browse grid so each test controls its own starting point
    await page.getByRole('button', { name: 'Clean Shopper' }).click()
    await expect(page.getByRole('heading', { name: 'Shop Clean' })).toBeVisible({ timeout: 5000 })
  })

  // ── Rendering ──────────────────────────────────────────────────────────────

  test('clicking Cart in the NavBar renders the Cart page', async ({ page }) => {
    await goToCart(page)
    await expect(page.getByRole('heading', { name: 'Your Cart' })).toBeVisible()
  })

  test('page title shows "Your Cart" with the live item count inline', async ({ page }) => {
    await goToCart(page)
    await expect(page.getByRole('heading', { name: 'Your Cart' })).toBeVisible()
    // Count text is rendered as e.g. "(0 items)"
    await expect(page.getByText(/\(\d+ items?\)/)).toBeVisible()
  })

  test('empty state renders with "Your cart is empty" and a Browse Products CTA', async ({ page }) => {
    await goToCart(page)
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 8000 })
    await expect(page.getByText('Your cart is empty')).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Browse Products', exact: true })
    ).toBeVisible()
  })

  test('"Browse Products" empty state CTA navigates to the browse page', async ({ page }) => {
    await goToCart(page)
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 8000 })
    await page.getByRole('button', { name: 'Browse Products', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Shop Clean' })).toBeVisible({ timeout: 5000 })
  })

  // ── Loading state ──────────────────────────────────────────────────────────

  test('page title "Your Cart" is visible immediately during the loading state', async ({ page }) => {
    // Navigate to Cart and check the h1 before waiting for data to arrive
    await page.locator('nav').getByRole('button', { name: /^Cart/ }).click()
    // h1 must appear right away — no waiting for Supabase fetch
    await expect(page.getByRole('heading', { name: 'Your Cart' })).toBeVisible({ timeout: 3000 })
  })

  test('4 CartItem skeleton rows render while cart data is loading', async ({ page }) => {
    await page.locator('nav').getByRole('button', { name: /^Cart/ }).click()
    // Skeleton blocks appear immediately; check before the fetch resolves
    await expect(page.locator('.animate-pulse').first()).toBeVisible({ timeout: 3000 })
    const count = await page.locator('.animate-pulse').count()
    expect(count).toBeGreaterThanOrEqual(4)
  })

  // ── Add to cart & cart contents ────────────────────────────────────────────

  test('adding a product makes the NavBar cart badge appear', async ({ page }) => {
    await addFirstProductToCart(page)
    await expect(cartBadge(page)).toBeVisible({ timeout: 3000 })
  })

  test('added product appears in the cart list with its name and a safety badge', async ({ page }) => {
    const productName = await addFirstProductToCart(page)
    await goToCart(page)
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 8000 })

    await expect(page.getByText(productName)).toBeVisible()
    // SafetyBadge renders as "Clean", "Mixed", or "Caution"
    await expect(page.getByText(/^(Clean|Mixed|Caution)$/).first()).toBeVisible()
  })

  test('item count in the page title reflects the number of cart entries', async ({ page }) => {
    await addFirstProductToCart(page)
    await goToCart(page)
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 8000 })
    // 1 product at default quantity 1 → "(1 item)"
    await expect(page.getByText('(1 item)')).toBeVisible()
  })

  test('cart items are grouped by category with a heading above each group', async ({ page }) => {
    await addFirstProductToCart(page)
    await goToCart(page)
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 8000 })

    // CartPage renders category group headers as <h2> elements (styled text-h4)
    const categoryHeaders = page.getByRole('heading', { level: 2 })
    await expect(categoryHeaders.first()).toBeVisible()
  })

  // ── Remove ─────────────────────────────────────────────────────────────────

  test('clicking the remove button removes the item immediately (optimistic)', async ({ page }) => {
    const productName = await addFirstProductToCart(page)
    await goToCart(page)
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 8000 })
    await expect(page.getByText(productName)).toBeVisible()

    // Remove button aria-label: "Remove [name] from cart"
    await page.getByRole('button', { name: /^Remove .+ from cart$/ }).first().click()

    await expect(page.getByText(productName)).not.toBeVisible()
    // Empty state appears after the only item is removed
    await expect(page.getByText('Your cart is empty')).toBeVisible({ timeout: 5000 })
  })

  test('NavBar cart badge disappears after removing the last item', async ({ page }) => {
    await addFirstProductToCart(page)
    await expect(cartBadge(page)).toBeVisible({ timeout: 3000 })

    await goToCart(page)
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 8000 })
    await page.getByRole('button', { name: /^Remove .+ from cart$/ }).first().click()

    // Badge span should no longer exist
    await expect(cartBadge(page)).toHaveCount(0)
  })

  // ── Clear all ──────────────────────────────────────────────────────────────

  test('"Clear all" button is hidden when the cart is empty', async ({ page }) => {
    await goToCart(page)
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 8000 })
    await expect(
      page.getByRole('button', { name: 'Clear all', exact: true })
    ).toHaveCount(0)
  })

  test('"Clear all" button is visible when the cart has items', async ({ page }) => {
    await addFirstProductToCart(page)
    await goToCart(page)
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 8000 })
    await expect(
      page.getByRole('button', { name: 'Clear all', exact: true })
    ).toBeVisible()
  })

  test('clicking "Clear all" removes all items and shows the empty state', async ({ page }) => {
    await addFirstProductToCart(page)
    await goToCart(page)
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 8000 })

    await page.getByRole('button', { name: 'Clear all', exact: true }).click()

    await expect(page.getByText('Your cart is empty')).toBeVisible({ timeout: 5000 })
    await expect(
      page.getByRole('button', { name: 'Browse Products', exact: true })
    ).toBeVisible()
  })

  test('NavBar cart badge disappears after clearing the cart', async ({ page }) => {
    await addFirstProductToCart(page)
    await expect(cartBadge(page)).toBeVisible({ timeout: 3000 })

    await goToCart(page)
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 8000 })
    await page.getByRole('button', { name: 'Clear all', exact: true }).click()

    // Wait for CartPage's local state to show 0 items — this confirms setProducts([])
    // ran and the render cycle (including the useEffect that calls onCartCountChange)
    // has fully committed before we check the NavBar badge.
    await expect(page.getByText('(0 items)')).toBeVisible({ timeout: 5000 })
    await expect(cartBadge(page)).toHaveCount(0, { timeout: 5000 })
  })

  // ── Persistence ────────────────────────────────────────────────────────────

  test('cart items persist across a page refresh', async ({ page }) => {
    const productName = await addFirstProductToCart(page)
    await goToCart(page)
    await expect(page.getByText(productName)).toBeVisible({ timeout: 8000 })

    // Wait for the Supabase insert to finish before reloading
    await page.waitForTimeout(1500)
    await page.reload()

    // Supabase session is stored in localStorage — user stays signed in
    await expect(page.getByRole('heading', { name: 'Shop Clean' })).toBeVisible({ timeout: 10000 })

    await goToCart(page)
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 8000 })
    await expect(page.getByText(productName)).toBeVisible()
  })

  test('cart items persist across sign-out and sign-in', async ({ page }) => {
    const productName = await addFirstProductToCart(page)
    await goToCart(page)
    await expect(page.getByText(productName)).toBeVisible({ timeout: 8000 })
    await page.waitForTimeout(1500)

    // Sign out
    await page.getByRole('button', { name: 'Sign out', exact: true }).click()
    await expect(page.getByText('Sign in to your account')).toBeVisible({ timeout: 5000 })

    // Sign back in with the same credentials
    await signIn(page)

    await goToCart(page)
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 8000 })
    await expect(page.getByText(productName)).toBeVisible()
  })

})

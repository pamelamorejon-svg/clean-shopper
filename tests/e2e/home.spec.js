import { test, expect } from '@playwright/test'

test('home page loads without errors', async ({ page }) => {
  const consoleErrors = []

  // Collect any console errors during page load
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })

  // Navigate to the app root
  await page.goto('/')

  // App shell is visible — wordmark rendered
  await expect(page.getByText('Clean Shopper')).toBeVisible()

  // Sign-in form is present
  await expect(page.getByLabel('Email')).toBeVisible()
  await expect(page.getByLabel('Password')).toBeVisible()
  await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()

  // Sign-up link is present
  await expect(page.getByRole('button', { name: /sign up/i })).toBeVisible()

  // No console errors
  expect(consoleErrors).toHaveLength(0)
})

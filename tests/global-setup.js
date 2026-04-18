import { createClient } from '@supabase/supabase-js'

/**
 * Global setup — runs once before the entire test suite.
 *
 * 1. Ensures the shared Playwright test account exists in Supabase.
 * 2. Clears any saved products left over from previous runs so the
 *    save.spec.js test always starts from a clean slate.
 *
 * Supabase URL and anon key are public values (designed to be
 * exposed in the browser), so it is safe to reference them here.
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
  ?? 'https://khvedpzawfdosffoouit.supabase.co'

const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY
  ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtodmVkcHphd2Zkb3NmZm9vdWl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMTk5MDMsImV4cCI6MjA5MTU5NTkwM30.KcZS9jfdqkxVmjf56MP6ISjKlzjWsWW0qstQlp-R7xw'

const TEST_EMAIL = process.env.PLAYWRIGHT_TEST_EMAIL
  ?? 'playwright@cleanshoppertest.dev'

const TEST_PASSWORD = process.env.PLAYWRIGHT_TEST_PASSWORD
  ?? 'playwright123'

export default async function globalSetup() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  // ── Ensure the test account exists ─────────────────────────────────────────
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  })

  if (signInError) {
    // Account not found — create it
    const { error: signUpError } = await supabase.auth.signUp({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    })
    if (signUpError) {
      throw new Error(
        `Could not create Playwright test account (${TEST_EMAIL}): ${signUpError.message}\n` +
        `Set PLAYWRIGHT_TEST_EMAIL and PLAYWRIGHT_TEST_PASSWORD to use an existing account.`
      )
    }
    console.log(`  ✓ Test account created: ${TEST_EMAIL}`)
  } else {
    console.log(`  ✓ Test account ready: ${TEST_EMAIL}`)
  }

  // ── Clear test data from previous runs ──────────────────────────────────────
  // Ensures save.spec.js and cart.spec.js always start from a clean slate.
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await supabase.from('saved_products').delete().eq('user_id', user.id)
    console.log(`  ✓ Cleared saved products for test user`)
    await supabase.from('cart_items').delete().eq('user_id', user.id)
    console.log(`  ✓ Cleared cart items for test user`)
  }
}

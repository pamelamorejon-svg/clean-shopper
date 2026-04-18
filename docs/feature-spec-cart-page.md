# Feature Spec: Cart Page
**Version:** 1.0
**Date:** 2026-04-17
**Status:** Draft

---

## What the Feature Does

The Cart page is the user's personal shopping list — a persistent record of products they intend to buy. It is not an e-commerce checkout; it has no payment flow or retailer links. Its purpose is to help ingredient-aware shoppers track which products they've decided are worth purchasing, organized clearly so they can act on the list at any store.

Users arrive here by clicking "Cart" in the NavBar. They can view all items they've added, remove individual items, clear the entire list, and navigate to a product's detail view to review it before buying. The cart count badge on the NavBar reflects the live item count.

**Where it appears:** `activeTab === 'cart'` — rendered by App.jsx at the same level as BrowsePage and PreferencesPage.

**Data source:** Supabase — a `cart_items` table (`user_id`, `product_id`, `created_at`) mirrors the pattern established by `saved_products`. The current App.jsx local `cartIds` state is replaced by Supabase-backed persistence so the cart survives page refresh and sign-out/sign-in cycles. A new API module at `src/lib/api/cart.js` handles all queries.

**Cart count:** `cartCount` in App.jsx is derived from Supabase on mount and kept in sync with optimistic updates on add/remove actions.

---

## Existing Components Reused

| Component | Where used | Notes |
|---|---|---|
| `EmptyState` | When the cart has no items | `heading="Your cart is empty"`, `description="Add products from the Browse page to build your shopping list."`, `action={{ label: 'Browse Products', onClick: () => onNavigate('research'), variant: 'primary' }}` |
| `SafetyBadge` | Inside each `CartItem` row | `size="sm"` — shows the product's rating at a glance without needing the full ProductCard |
| `CategoryTag` | Inside each `CartItem` row | Non-clickable; labels the product's category inline |
| `Button` | Remove button on each row; "Clear all" action in the page header | Remove uses `variant="secondary" size="sm"`; Clear all uses `variant="secondary"` |

`ProductCard` is **not** reused here. Cart items are displayed as compact rows (`CartItem`), not full cards — the image and summary are omitted to keep the list scannable. The user has already assessed these products; the cart is an action list, not a research view.

---

## New Components Required

### `CartPage`

**File:** `src/features/cart/CartPage.jsx`

**Purpose:** Page container. Fetches cart items from Supabase on mount, manages loading and empty states, renders the item list grouped by category, and provides the "Clear all" action.

#### Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `onNavigate` | `function` | ✅ | Passed from App.jsx — used by the EmptyState CTA to navigate to Browse |
| `onCartCountChange` | `function` | ❌ | Called with the new item count after any add/remove/clear so App.jsx can sync the NavBar badge |

#### Visual Structure

```
Your Cart                    (3 items)       ← h1 + item count badge + Clear all button
─────────────────────────────────────────    ← divider neutral-200

Personal Care                                ← h4 category group header
  [ CartItem ]
  [ CartItem ]

Home Cleaning                                ← h4 category group header
  [ CartItem ]

              [Browse Products]              ← EmptyState (when empty)
```

**Page wrapper:** `min-h-screen bg-neutral-50`

**Content container:** `max-w-screen-xl mx-auto px-space-lg pt-space-2xl pb-space-2xl`

**Page header row:** `flex items-center justify-between mb-space-xl`

**Page title:** `text-h1 font-cormorant text-neutral-900`

**Item count:** rendered inline next to the title as `text-body font-jost text-neutral-600 ml-space-sm` — e.g. "(3 items)"

**Clear all button:** `Button variant="secondary" size="sm"` — only rendered when cart has items. Triggers a confirmation step (inline text swap, not a modal) before clearing.

**Divider:** `border-t border-neutral-200 mb-space-xl`

**Category group header:** `text-h4 font-jost text-neutral-900 mb-space-md mt-space-xl` — first group omits `mt-space-xl`

**Item list:** `flex flex-col gap-space-sm` within each category group

#### States

| State | Behavior |
|---|---|
| Loading | 4 `CartItem` skeletons rendered in a single list (no category grouping during load) |
| Loaded with items | Items grouped by category, each group headed by a `text-h4` category label |
| Empty | `EmptyState` centered in the content area |
| Clear confirmation | "Clear all" button label swaps to "Are you sure?" with a secondary "Cancel" link inline; one more click confirms and clears |
| Error | Inline `text-error` message below the page header; items that did load are still shown |

---

### `CartItem`

**File:** `src/features/cart/CartItem.jsx`

**Purpose:** A single compact row in the cart list. Displays product name, brand, category tag, and safety badge. Provides a remove action. Intentionally lighter than `ProductCard` — no image, no summary, no save action.

#### Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `product` | `object` | ✅ | Product data: `id`, `name`, `brand`, `category`, `rating` |
| `onRemove` | `function` | ✅ | Called when the user clicks the remove button |
| `isLoading` | `boolean` | ❌ | When `true`, renders the skeleton variant |

#### Visual Structure

```
┌─────────────────────────────────────────────────────────┐
│  Product Name                [Personal Care] [Clean]  ✕  │
│  Brand Name                                              │
└─────────────────────────────────────────────────────────┘
```

**Container:** `flex items-center justify-between gap-space-md bg-secondary-cream rounded-radius-md px-space-lg py-space-md`

**Left block:**
```
flex flex-col gap-space-xs
  → text-h4 font-cormorant text-neutral-900   (product name)
  → text-small font-jost text-neutral-600      (brand)
```

**Right block:** `flex items-center gap-space-sm shrink-0`
- `CategoryTag label={category}` (non-clickable)
- `SafetyBadge rating={rating} size="sm"`
- Remove button: `<button>` with an × icon, `text-neutral-400 hover:text-error transition-colors duration-150 focus:outline-none`

**Skeleton variant:** when `isLoading`, render placeholder blocks using `bg-neutral-200 rounded-radius-md animate-pulse` matching the container's dimensions.

#### States

| State | Behavior |
|---|---|
| Default | Resting row at `bg-secondary-cream` |
| Hover | `hover:shadow-sm` on the container — `transition-shadow duration-150` |
| Loading | Skeleton — two placeholder lines on the left, two pill placeholders on the right |
| Removing | Optimistic: row disappears immediately; reverts if the API call fails |

#### Usage Rules

- **Use only inside `CartPage`.** Not a shared component — lives in `src/features/cart/`.
- **Do not use `ProductCard`** for cart rows. `CartItem` is intentionally compact.
- Always render `onRemove`. There is no read-only cart view.

---

## New API Module

**File:** `src/lib/api/cart.js`

Follows the exact pattern of `src/lib/api/saved-products.js`.

| Export | Description |
|---|---|
| `fetchCartProducts()` | Fetches cart item IDs, then fetches full product records. Returns `{ products, ids }` where `ids` is a `Set` for App.jsx badge sync. |
| `addToCart(productId)` | Inserts a row into `cart_items` for the current user. |
| `removeFromCart(productId)` | Deletes the matching row from `cart_items`. |
| `clearCart()` | Deletes all `cart_items` rows for the current user. |

App.jsx replaces the local `cartIds` Set with a Supabase-backed count, initialized by `fetchCartProducts()` on mount and updated optimistically on `addToCart` / `removeFromCart` / `clearCart`.

---

## Design Tokens Applied to New Components

All values reference tokens from `tailwind.config.js`. No hardcoded hex, pixel, or spacing values.

### Typography

| Element | Token(s) |
|---|---|
| Page title | `text-h1 font-cormorant text-neutral-900` |
| Item count | `text-body font-jost text-neutral-600` |
| Category group header | `text-h4 font-jost text-neutral-900` |
| Product name in row | `text-h4 font-cormorant text-neutral-900` |
| Brand in row | `text-small font-jost text-neutral-600` |

### Spacing

| Element | Token(s) |
|---|---|
| Page top/bottom padding | `pt-space-2xl pb-space-2xl` |
| Header bottom margin | `mb-space-xl` |
| Divider bottom margin | `mb-space-xl` |
| Category group top margin | `mt-space-xl` (omit on first group) |
| Category group heading bottom margin | `mb-space-md` |
| Gap between cart rows | `gap-space-sm` |
| CartItem internal padding | `px-space-lg py-space-md` |
| Right block element gap | `gap-space-sm` |

### Colors

| Element | Token(s) |
|---|---|
| Page background | `bg-neutral-50` |
| Cart row surface | `bg-secondary-cream` |
| Product name | `text-neutral-900` |
| Brand / item count | `text-neutral-600` |
| Category header | `text-neutral-900` |
| Remove icon (rest) | `text-neutral-400` |
| Remove icon (hover) | `hover:text-error` |
| Divider | `border-neutral-200` |

### Shadows & Radius

| Element | Token(s) |
|---|---|
| CartItem hover | `hover:shadow-sm` |
| CartItem border radius | `rounded-radius-md` |

---

## File Locations Summary

| File | Purpose |
|---|---|
| `src/features/cart/CartPage.jsx` | New page component |
| `src/features/cart/CartItem.jsx` | New row component, scoped to cart feature |
| `src/lib/api/cart.js` | New API module for Supabase cart operations |

App.jsx changes: replace local `cartIds` Set with Supabase-backed state; pass `onCartCountChange` to `CartPage`; wire `addToCart` through `cart.js`.

---

## Acceptance Criteria

**Rendering**
- [ ] Clicking "Cart" in the NavBar renders `CartPage`
- [ ] Page title reads "Your Cart" with the live item count inline
- [ ] Items are grouped by category with a `text-h4` category header per group
- [ ] Each item row shows product name, brand, `CategoryTag`, and `SafetyBadge`
- [ ] `EmptyState` renders when the cart has zero items, with a "Browse Products" CTA

**Loading state**
- [ ] While data fetches, 4 `CartItem` skeletons are displayed
- [ ] Page title and header render normally during load

**Remove**
- [ ] Clicking ✕ on a row removes it immediately (optimistic)
- [ ] If the API call fails, the row reappears
- [ ] NavBar cart badge count decrements on remove

**Clear all**
- [ ] "Clear all" button is only visible when cart has items
- [ ] Clicking "Clear all" shows an inline confirmation before clearing
- [ ] Confirming clear removes all rows and shows `EmptyState`
- [ ] NavBar cart badge disappears after clearing

**Persistence**
- [ ] Cart items persist across page refresh
- [ ] Cart items persist across sign-out and sign-in
- [ ] Items added via "Add to Cart" on `ProductCard` appear in the cart on next visit to the Cart tab

**NavBar badge**
- [ ] Badge shows the correct count at all times
- [ ] Badge disappears when count reaches zero

**Design system**
- [ ] All spacing, color, typography, and border-radius use Tailwind theme token classes — no hardcoded values
- [ ] `CartItem` uses `font-cormorant` for product names, `font-jost` for all other text
- [ ] Remove icon uses `text-error` on hover, `text-neutral-400` at rest

**Code conventions**
- [ ] All Supabase queries live in `src/lib/api/cart.js`
- [ ] `CartPage` and `CartItem` live in `src/features/cart/` — not in `src/components/`
- [ ] `component-spec.md` is updated with `CartItem` before building begins

---

*Update component-spec.md with `CartItem` before building.*

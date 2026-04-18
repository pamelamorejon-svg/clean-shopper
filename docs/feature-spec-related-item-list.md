# Feature Spec: Related Item List
**Version:** 1.0
**Date:** 2026-04-17
**Status:** Draft

---

## What the Feature Does

The Related Item List surfaces a curated set of products that are similar to a product the user is currently viewing. It appears below a product's detail view and gives users a path to explore safer alternatives or comparable products without returning to the search bar. Similarity is determined by category match and safety rating proximity — the AI already has the product's category and rating from the initial research flow, so no additional API call is required to generate the list; the related items are drawn from already-researched products stored in the user's Supabase database, filtered by category.

This feature serves the core user need of "I found a product I like — what else is comparable?" and keeps users in the research flow longer without adding friction.

**Where it appears:** Below the primary product detail view in the Research tab, after a product has been assessed and displayed.

**Trigger:** Rendered automatically when a product is selected or assessed. Hidden when no related items exist.

**Data source:** Supabase — queries the `products` table for items matching the selected product's category, excluding the selected product itself. Results are ordered by rating (`clean` first, then `mixed`, then `avoid`) and limited to 4 items.

---

## Existing Components Reused

| Component | Where used in this feature | Notes |
|---|---|---|
| `ProductCard` | Each item in the related list is a full `ProductCard` | Pass `onSave` and `onAddToCart` handlers so list items are immediately actionable; `isLoading` skeleton used during data fetch |
| `SafetyBadge` | Rendered inside each `ProductCard` automatically | No direct usage — included via `ProductCard` |
| `CategoryTag` | Rendered inside each `ProductCard` automatically | No direct usage — included via `ProductCard` |
| `Button` | "See all in [Category]" link rendered as a secondary `Button` below the list | Navigates to the Library view filtered by category |
| `EmptyState` | Shown when the query returns zero results | `heading="No similar products found"`, `description="We haven't assessed other products in this category yet. Try searching for an alternative."`, no `action` prop — the search bar is already visible above |

---

## New Components Required

### `RelatedItemList`

**File:** `src/features/browse/RelatedItemList.jsx`

Placed in `src/features/browse/` because it is specific to the Research/Browse screen and is not reused across other views.

**Purpose:** Container component that fetches related products from Supabase, manages loading and empty states, renders the section header and scrollable product card row, and provides a "See all" secondary action.

#### Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `category` | `string` | ✅ | Category of the selected product — used as the Supabase filter |
| `excludeProductId` | `string` | ✅ | ID of the currently viewed product — excluded from results |
| `onSave` | `function` | ❌ | Passed through to each `ProductCard`'s `onSave` prop |
| `onAddToCart` | `function` | ❌ | Passed through to each `ProductCard`'s `onAddToCart` prop |
| `onViewCategory` | `function` | ❌ | Called when the user clicks "See all in [Category]"; receives `category` as argument |

#### Visual Structure

```
Related Products in [Category]         ← text-h2 font-cormorant text-neutral-900
                                       mt-space-2xl mb-space-lg

┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ProductCard│ │ProductCard│ │ProductCard│ │ProductCard│
└──────────┘ └──────────┘ └──────────┘ └──────────┘
                                       gap-space-lg
                                       overflow-x-auto

              [See all in Personal Care]    ← Button secondary, mt-space-lg
```

**Section wrapper:**
`mt-space-2xl`

**Section heading:**
`text-h2 font-cormorant text-neutral-900 mb-space-lg`

Heading text: `"Related Products in {category}"`

**Card row:**
`flex gap-space-lg overflow-x-auto pb-space-md`
— horizontal scroll on overflow so the row does not wrap or break layout at narrow widths. Each card receives `min-w-[280px]` to maintain readable card width during scroll.

**"See all" action:**
`mt-space-lg flex justify-start`
— `Button` with `variant="secondary"`, label `"See all in {category}"`, `onClick={onViewCategory}`.
Only rendered when `onViewCategory` is provided and `products.length > 0`.

#### States

| State | Behavior |
|---|---|
| Loading | Renders 4 `ProductCard` instances with `isLoading={true}` (skeletons). Section heading renders normally during load — no layout shift. |
| Loaded with results | Renders up to 4 `ProductCard` components with real product data. |
| Loaded — no results | Renders `EmptyState` in place of the card row. "See all" button is hidden. |
| Error | Silently suppresses the section (returns `null`) — related products are a discovery enhancement, not a primary flow. Does not surface an error state to the user. |

#### Data Fetching

Fetching lives in `src/lib/api/related-products.js` — a named export `fetchRelatedProducts(category, excludeProductId)` that queries Supabase. The component calls this on mount and when `category` or `excludeProductId` changes. Uses local `useState` for `products`, `isLoading`, and `error`.

---

## Design Tokens Applied to New Components

All values reference tokens from `tailwind.config.js`. No hardcoded hex, pixel, or spacing values.

### Typography
| Element | Token(s) |
|---|---|
| Section heading | `text-h2 font-cormorant text-neutral-900` |
| (Card content inherits from `ProductCard` spec) | — |

### Spacing
| Element | Token(s) |
|---|---|
| Section top margin | `mt-space-2xl` — separates the related list from the product detail above |
| Heading bottom margin | `mb-space-lg` |
| Gap between cards | `gap-space-lg` |
| Row bottom padding (scroll clearance) | `pb-space-md` |
| "See all" button top margin | `mt-space-lg` |

### Colors
| Element | Token(s) |
|---|---|
| Section heading | `text-neutral-900` |
| Card surfaces | `bg-secondary-cream` (inherited from `ProductCard`) |
| "See all" button | `border-accent text-accent hover:bg-secondary-sage` (inherited from `Button` secondary variant) |
| Empty state | Inherited from `EmptyState` spec |

### Shadows
| Element | Token(s) |
|---|---|
| Cards at rest | `shadow-sm` (inherited from `ProductCard`) |
| Cards on hover | `shadow-md` (inherited from `ProductCard`) |

### Border Radius
| Element | Token(s) |
|---|---|
| Cards | `rounded-radius-lg` (inherited from `ProductCard`) |

---

## File Locations Summary

| File | Purpose |
|---|---|
| `src/features/browse/RelatedItemList.jsx` | New component — section container |
| `src/lib/api/related-products.js` | New API helper — Supabase query for related products |

No changes required to `src/components/` — all shared components are reused as-is.

---

## Acceptance Criteria

The feature is complete when all of the following are true:

**Rendering**
- [ ] `RelatedItemList` renders below a selected/assessed product in the Research tab
- [ ] Section heading reads "Related Products in [category name]"
- [ ] Up to 4 products are displayed; if fewer than 4 exist, only those are shown
- [ ] The selected product does not appear in its own related list
- [ ] Products are ordered: `clean` first, `mixed` second, `avoid` last

**Loading state**
- [ ] While data is fetching, 4 `ProductCard` skeletons are displayed
- [ ] Section heading is visible during the loading state (no layout shift when cards populate)

**Empty state**
- [ ] When no related products exist for the category, `EmptyState` renders in place of the card row
- [ ] The "See all" button is not rendered in the empty state

**Actions**
- [ ] Each `ProductCard` in the list supports Save and Add to List actions, identical to cards in search results
- [ ] "See all in [Category]" button appears only when `onViewCategory` is provided and results are non-empty
- [ ] Clicking "See all in [Category]" calls `onViewCategory` with the category string

**Layout**
- [ ] On narrower screens, the card row scrolls horizontally without wrapping
- [ ] Each card maintains a minimum width that keeps it readable during scroll
- [ ] The section does not render at all (returns `null`) when the fetch produces an error

**Design system**
- [ ] All spacing, color, typography, and border-radius values use Tailwind theme token classes — no hardcoded values
- [ ] Section heading uses `font-cormorant` (Cormorant Garamond)
- [ ] "See all" button uses the `Button` component with `variant="secondary"` — no custom button element

**Code conventions**
- [ ] Supabase query is in `src/lib/api/related-products.js`, not inline in the component
- [ ] Component is in `src/features/browse/`, not `src/components/`
- [ ] Component-spec.md is updated to include `RelatedItemList` before implementation begins

---

*Update component-spec.md with the `RelatedItemList` entry before building.*

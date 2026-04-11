# Component Specification: Clean Shopper
**Version:** 1.0
**Last Updated:** 2026-04-11
**Source:** Generated from /docs/design-system.md and tailwind.config.js

---

## How to Use This Document
This file is referenced by CLAUDE.md and read by Claude Code at the start of every session. Before creating a new component, check here first — if a component below covers your use case, use it. Do not create a new component that duplicates one listed here.

All Tailwind classes below reference tokens defined in `tailwind.config.js`. Never substitute hardcoded hex values, pixel sizes, or spacing values.

---

## Component Index

1. [ProductCard](#1-productcard)
2. [SafetyBadge](#2-safetybadge)
3. [SearchBar](#3-searchbar)
4. [CategoryTag](#4-categorytag)
5. [NavBar](#5-navbar)
6. [Button](#6-button)
7. [InputField](#7-inputfield)
8. [EmptyState](#8-emptystate)

---

## 1. ProductCard

**Purpose:** Displays a single product's name, brand, safety rating, category, and summary description, with actions to save the product or add it to the shopping list.

### Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `product` | `object` | ✅ | Product data object (see shape below) |
| `product.name` | `string` | ✅ | Product display name |
| `product.brand` | `string` | ✅ | Brand name |
| `product.category` | `string` | ✅ | Product category label (e.g. "Personal Care") |
| `product.rating` | `'clean' \| 'mixed' \| 'avoid'` | ✅ | AI-generated safety assessment |
| `product.summary` | `string` | ✅ | One- to two-sentence AI-generated description |
| `product.imageUrl` | `string` | ❌ | Product image URL; falls back to placeholder if omitted |
| `isSaved` | `boolean` | ❌ | Whether the product is already in the user's library; defaults to `false` |
| `onSave` | `function` | ❌ | Called when the user saves or unsaves the product |
| `onAddToCart` | `function` | ❌ | Called when the user adds the product to their shopping list |
| `isLoading` | `boolean` | ❌ | When `true`, renders the loading skeleton instead of content |

### Visual Structure

```
┌─────────────────────────────────────────────┐  rounded-radius-lg
│  [Product Image]                             │  bg-secondary-cream
│                                             │  shadow-sm
│  [CategoryTag]                [SafetyBadge]  │  p-space-lg
│                                             │
│  Product Name                               │  text-h3 font-cormorant text-neutral-900
│  Brand Name                                 │  text-small font-jost text-neutral-600
│                                             │  mt-space-xs
│  Summary description copy goes here...      │  text-body font-jost text-neutral-600
│                                             │  mt-space-md
│  [Save Button (secondary)]  [Add to List]   │  mt-space-lg gap-space-sm
└─────────────────────────────────────────────┘
```

**Container:** `bg-secondary-cream rounded-radius-lg shadow-sm p-space-lg flex flex-col gap-space-md`

**Image area:** `w-full aspect-video object-cover rounded-radius-md bg-neutral-200` (neutral-200 as placeholder background)

**Product name:** `text-h3 font-cormorant text-neutral-900`

**Brand:** `text-small font-jost text-neutral-600`

**Summary:** `text-body font-jost text-neutral-600`

**Action row:** `flex gap-space-sm mt-space-lg`

### States

**Default:** `shadow-sm` at rest.

**Hover:** `shadow-md` — apply `hover:shadow-md transition-shadow duration-200` on the card container.

**Loading (skeleton):** Replace all text and image content with shimmer placeholder blocks. Skeleton blocks use `bg-neutral-200 rounded-radius-md animate-pulse`. The card shell retains its full structure and dimensions so the layout does not shift when content loads.

**Saved:** The save button switches to its saved variant (see Button spec). No other visual change on the card itself.

### Usage Rules

- **Use when:** Displaying any product in search results, the saved library, the shopping list, or a comparison view.
- **Do not use when:** You need only a product name and rating inline — use `SafetyBadge` and a text element directly instead.
- **One card per product.** Do not nest a ProductCard inside another ProductCard.
- The `onSave` and `onAddToCart` props are optional so the card can be used in read-only contexts (e.g. comparison view) without those actions.

---

## 2. SafetyBadge

**Purpose:** Communicates a product's or ingredient's AI-generated safety assessment (Clean, Mixed, or Avoid) using a color-coded pill label with semantic meaning.

### Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `rating` | `'clean' \| 'mixed' \| 'avoid'` | ✅ | Safety assessment level |
| `size` | `'sm' \| 'md'` | ❌ | `'md'` is default; `'sm'` for use inside tight spaces like table rows |

### Visual Structure

A single pill-shaped label. Label text is always capitalized.

**Base classes (all variants):**
`inline-flex items-center rounded-radius-full font-jost font-medium`

**Size — `md` (default):**
`text-small px-space-md py-space-xs`

**Size — `sm`:**
`text-micro px-space-sm py-space-xs`

**Color variants:**

| Rating | Background | Text | Classes |
|---|---|---|---|
| `clean` | success | white | `bg-success text-white` |
| `mixed` | warning | white | `bg-warning text-white` |
| `avoid` | error | white | `bg-error text-white` |

### States

SafetyBadge is display-only and has no interactive states. It does not change on hover, focus, or click.

### Usage Rules

- **Use when:** Showing a product or ingredient safety rating anywhere in the app — on ProductCard, in comparison views, in ingredient detail panels.
- **Do not use for decoration.** Semantic colors (`success`, `warning`, `error`) carry meaning. Never repurpose them for non-safety contexts.
- **Do not use for category labels** — use `CategoryTag` instead.
- Always render the badge alongside a product name or context label. Never render it as the only element in a container.

---

## 3. SearchBar

**Purpose:** Accepts natural-language product research queries from the user and submits them to the AI research flow.

### Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `value` | `string` | ✅ | Controlled input value |
| `onChange` | `function` | ✅ | Called on every keystroke with the new value |
| `onSubmit` | `function` | ✅ | Called when the user submits a query (Enter key or button click) |
| `placeholder` | `string` | ❌ | Input placeholder text; defaults to `"Search for a product or describe what you're looking for…"` |
| `isLoading` | `boolean` | ❌ | When `true`, disables the input and shows a loading spinner on the submit button |

### Visual Structure

```
┌───────────────────────────────────────────[Submit]┐
│  placeholder or user query text...                 │
└────────────────────────────────────────────────────┘
```

**Outer wrapper:** `flex items-center gap-space-sm w-full`

**Input field:**
`flex-1 bg-neutral-100 border border-neutral-200 rounded-radius-md px-space-md py-space-md text-body font-jost text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-primary-dark focus:shadow-md transition-shadow duration-200`

**Submit button:** Uses the `Button` component with `variant="primary"`. When `isLoading` is `true`, pass `isLoading={true}` to the Button.

### States

**Default:** `border-neutral-200`, no shadow.

**Focused:** `border-primary-dark shadow-md` — Tailwind `focus:` variants handle this on the input element.

**Loading:** Input is `disabled` (add `disabled:opacity-50 disabled:cursor-not-allowed`). Submit button shows loading spinner (see Button spec).

**Error:** Not shown inline on this component — surface API or AI errors in a Toast or AlertBanner above the search bar, not inside it.

### Usage Rules

- **Use when:** The user needs to enter a free-text product research query. This is the primary entry point for the Research view.
- **Do not use for:** Short, structured form fields (e.g. adding a brand preference) — use `InputField` instead.
- **There should be only one SearchBar visible at a time.** It lives at the top of the Research view.
- The submit button is always a primary `Button`. Do not substitute a plain icon button or text link.

---

## 4. CategoryTag

**Purpose:** Labels a product with its category (e.g. "Personal Care," "Cleaning," "Pantry") as a small, non-interactive identifier.

### Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `label` | `string` | ✅ | Category name to display |
| `onClick` | `function` | ❌ | If provided, the tag becomes clickable (e.g. to filter by category in the library view) |

### Visual Structure

**Base classes:**
`inline-flex items-center rounded-radius-sm bg-secondary-sage text-small font-jost text-neutral-900 px-space-sm py-space-xs`

**When `onClick` is provided, add:**
`cursor-pointer hover:bg-primary-light transition-colors duration-150`

### States

**Default (no `onClick`):** Static display element. No hover, focus, or active state.

**Clickable (`onClick` provided):**
- Default: `bg-secondary-sage`
- Hover: `bg-primary-light`

**Active/selected (when used as a filter):** `bg-primary-dark text-neutral-50` — the parent component controls selected state by conditionally applying these classes.

### Usage Rules

- **Use when:** You need to label a product's category on a ProductCard, section header, or filter chip.
- **Do not use for safety ratings** — use `SafetyBadge` instead.
- **Do not use for ingredient labels** — ingredient tags have their own safety-color logic that CategoryTag does not support.
- Keep label text to one or two words. Do not use a CategoryTag for a sentence or phrase.

---

## 5. NavBar

**Purpose:** Provides persistent top-level navigation across all views of the app, displaying the Clean Shopper logo/wordmark and the four primary navigation tabs.

### Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `activeTab` | `'research' \| 'library' \| 'cart' \| 'preferences'` | ✅ | Currently active view |
| `onTabChange` | `function` | ✅ | Called with the new tab key when the user clicks a tab |
| `cartCount` | `number` | ❌ | Number of items in the shopping list; displays a badge on the Cart tab when greater than 0 |

### Visual Structure

```
┌──────────────────────────────────────────────────────────────────┐
│  Clean Shopper            Research  My Products  Cart  Preferences│
└──────────────────────────────────────────────────────────────────┘
```

**Container:** `w-full bg-neutral-50 border-b border-neutral-200 px-space-2xl py-space-md flex items-center justify-between`

**Wordmark/logo:** `text-h4 font-cormorant text-neutral-900 tracking-wide`

**Tab list:** `flex items-center gap-space-xl`

**Tab item (base):** `text-small font-jost text-neutral-600 cursor-pointer pb-space-xs border-b-2 border-transparent transition-colors duration-150`

**Tab item (active):** `text-accent border-b-2 border-accent`

**Tab item (hover, non-active):** `hover:text-neutral-900`

**Cart badge:** When `cartCount > 0`, render a count indicator next to the Cart label:
`ml-space-xs bg-accent text-white text-micro font-jost rounded-radius-full px-space-xs py-space-xs leading-none`

### States

**Default tab:** `text-neutral-600 border-transparent`

**Active tab:** `text-accent border-accent`

**Hover (non-active tab):** `hover:text-neutral-900`

NavBar itself has no loading or error state — it is always visible and functional.

### Usage Rules

- **Use once, at the top of every view.** Never render NavBar more than once per page or inside a card or panel.
- **Do not add tabs** beyond the four defined here (Research, My Products, Cart, Preferences) without explicitly planning a new view. V1 has exactly four tabs.
- The wordmark is not a link and does not navigate. It is a brand identifier only.
- Do not use NavBar inside a modal or drawer — navigation is a page-level concern.

---

## 6. Button

**Purpose:** The primary interactive control for all call-to-action moments, available in a primary variant (accent green, one prominent use per view) and a secondary variant (outlined, for supporting actions).

### Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `children` | `node` | ✅ | Button label text or content |
| `variant` | `'primary' \| 'secondary'` | ❌ | Visual style; defaults to `'primary'` |
| `onClick` | `function` | ❌ | Click handler |
| `type` | `'button' \| 'submit' \| 'reset'` | ❌ | HTML button type; defaults to `'button'` |
| `disabled` | `boolean` | ❌ | Prevents interaction and applies disabled styling |
| `isLoading` | `boolean` | ❌ | Shows a loading spinner and disables the button while an async action is in progress |
| `fullWidth` | `boolean` | ❌ | When `true`, button expands to fill its container width |

### Visual Structure

**Base classes (shared by both variants):**
`inline-flex items-center justify-center gap-space-sm rounded-radius-md text-small font-jost font-medium px-space-lg py-space-md transition-colors duration-150 focus:outline-none`

**Primary variant:**
`bg-accent text-white hover:bg-accent-light active:bg-accent disabled:opacity-40 disabled:cursor-not-allowed`

**Secondary variant:**
`bg-transparent border border-accent text-accent hover:bg-secondary-sage active:bg-secondary-sage disabled:opacity-40 disabled:cursor-not-allowed`

**Full width:** Add `w-full` when `fullWidth={true}`.

**Loading state:** Replace button content with a spinner icon (SVG, 16×16) and the label text. Keep the label visible alongside the spinner so the button does not collapse. Button is `disabled` while `isLoading` is `true`.

```jsx
// Loading content structure
<svg class="animate-spin text-current" .../>
<span>{children}</span>
```

### States

| State | Primary | Secondary |
|---|---|---|
| Default | `bg-accent text-white` | `border-accent text-accent bg-transparent` |
| Hover | `bg-accent-light` | `bg-secondary-sage` |
| Active | `bg-accent` | `bg-secondary-sage` |
| Disabled | `opacity-40 cursor-not-allowed` | `opacity-40 cursor-not-allowed` |
| Loading | Spinner + label, `disabled` | Spinner + label, `disabled` |

### Usage Rules

- **Primary buttons:** Use for the single most important action in a given view or card — "Search," "Save Product," "Add to List." Use accent green sparingly; there should be at most one primary button visible per major content zone.
- **Secondary buttons:** Use for supporting actions that accompany a primary action — "View Details," "Compare," "Remove." Never use a secondary button as the only action in a view.
- **Do not create icon-only buttons** using this component — icon buttons have different padding and accessibility requirements. Add a separate IconButton component if needed.
- **Do not use a `<div>` or `<span>` as a button.** Always use this component or a native `<button>` element for interactive controls.

---

## 7. InputField

**Purpose:** A labeled, single-line text input for structured form entries such as ingredient names to avoid, trusted brand names, and preference settings.

### Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | ✅ | Unique id linking the `<label>` to the `<input>` |
| `label` | `string` | ✅ | Visible label displayed above the input |
| `value` | `string` | ✅ | Controlled input value |
| `onChange` | `function` | ✅ | Called on every keystroke |
| `type` | `string` | ❌ | HTML input type; defaults to `'text'` |
| `placeholder` | `string` | ❌ | Placeholder text shown when the field is empty |
| `hint` | `string` | ❌ | Supporting copy shown below the input in a non-error state |
| `error` | `string` | ❌ | Validation error message; when provided, triggers error styling |
| `required` | `boolean` | ❌ | Marks the field as required; adds a visual indicator to the label |
| `disabled` | `boolean` | ❌ | Prevents interaction and dims the field |

### Visual Structure

```
Label text *                           ← text-h4 font-jost text-neutral-900
┌──────────────────────────────────┐
│  placeholder or value            │   ← bg-neutral-100 border rounded-radius-md
└──────────────────────────────────┘
Hint or error message               ← text-micro font-jost
```

**Wrapper:** `flex flex-col gap-space-xs`

**Label:** `text-h4 font-jost text-neutral-900`
Required indicator: append `<span class="text-error ml-space-xs">*</span>` when `required={true}`

**Input:**
`w-full bg-neutral-100 border border-neutral-200 rounded-radius-md px-space-md py-space-md text-body font-jost text-neutral-900 placeholder:text-neutral-400 focus:outline-none transition-shadow duration-200`

**Hint text:** `text-micro font-jost text-neutral-600`

**Error message:** `text-micro font-jost text-error`

### States

**Default:** `border-neutral-200`, no shadow.

**Focused:** `border-primary-dark shadow-md` — apply via `focus:border-primary-dark focus:shadow-md` on the `<input>`.

**Error:** `border-error` on the input. Hint text is replaced by the error message in `text-error`. Apply via conditional class: `error ? 'border-error' : 'border-neutral-200'`.

**Disabled:** `disabled:opacity-50 disabled:cursor-not-allowed` on the input. Label also reduces to `text-neutral-400`.

**Filled (value present, not focused):** No additional styling — default border remains.

### Usage Rules

- **Use when:** Collecting a short, structured text value from the user in a form — brand names, ingredient names, certification keywords in the Preferences view.
- **Do not use for:** Long-form text input (use a `<textarea>` variant), or primary product search queries (use `SearchBar` instead).
- **Always include a `label`.** Never render an InputField without a visible label — placeholder text alone is not an accessible substitute.
- **One InputField per form row.** Do not arrange two InputFields side by side in a single row in V1 — the layout is single-column.
- Always associate `id` on the input with `htmlFor` on the label.

---

## 8. EmptyState

**Purpose:** Fills a content area gracefully when a list or results set has no items to display, giving the user context about why it's empty and a clear next action.

### Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `heading` | `string` | ✅ | Short title explaining the empty state |
| `description` | `string` | ✅ | One or two sentences giving the user context and direction |
| `icon` | `node` | ❌ | An optional SVG icon rendered above the heading |
| `action` | `object` | ❌ | Optional CTA button config — `{ label: string, onClick: function, variant: 'primary' \| 'secondary' }` |

### Visual Structure

```
         [Icon]               ← optional, centered, text-neutral-400, 48×48

    Nothing saved yet         ← text-h3 font-cormorant text-neutral-900

  Products you save will      ← text-body font-jost text-neutral-600
  appear here. Start by
  searching for a product.

     [Start Searching]        ← Button, variant from action.variant prop
```

**Outer container:** `flex flex-col items-center justify-center text-center py-space-2xl px-space-lg gap-space-lg`

**Icon wrapper:** `text-neutral-400` — the icon itself should be passed as an SVG element sized `w-12 h-12` (48px via Tailwind default scale; if a token is needed, add it to the config).

**Heading:** `text-h3 font-cormorant text-neutral-900`

**Description:** `text-body font-jost text-neutral-600 max-w-sm`

**Action button:** Rendered using the `Button` component with the `variant` and `label` from the `action` prop. `mt-space-md` above the button.

### States

EmptyState is a static display component. It has no interactive states of its own. The `action` button follows the `Button` component's own state logic.

**Context-specific instances** (controlled by the parent via props, not internal state):

| Context | Heading example | Has action? |
|---|---|---|
| Research (no results yet) | "Search for a product to get started" | No |
| Research (no results found) | "No products found" | No |
| My Products (library empty) | "Nothing saved yet" | Yes — "Start Searching" |
| Cart (list empty) | "Your shopping list is empty" | Yes — "Browse Products" |

### Usage Rules

- **Use when:** A list, results panel, or library section has zero items to display.
- **Do not use as a loading state.** While content is loading, show a skeleton or `LoadingIndicator` instead — EmptyState is only for when loading is complete and there is genuinely nothing to show.
- **Always include both `heading` and `description`.** A heading alone does not give the user enough direction.
- **Use the `action` prop** when there is a clear, direct next step the user can take from the empty state. Omit it when the empty state is informational and the action belongs elsewhere (e.g. the search bar is already visible above).
- Do not use more than one EmptyState per view.

---

*End of component spec. Update this document before building any new shared component.*

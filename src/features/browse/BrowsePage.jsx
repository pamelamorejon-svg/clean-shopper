import { useState } from 'react'
import ProductCard from '../../components/ProductCard'
import CategoryTag from '../../components/CategoryTag'

// ─── Placeholder product data ─────────────────────────────────────────────────

const PRODUCTS = [
  {
    id: 1,
    name: 'Pure Castile Liquid Soap',
    brand: "Dr. Bronner's",
    category: 'Personal Care',
    rating: 'clean',
    score: 94,
    summary:
      'USDA-certified organic with fair-trade coconut and olive oils. Free from synthetic preservatives, detergents, and foaming agents.',
  },
  {
    id: 2,
    name: 'Sensitive Skin Moisturizer',
    brand: 'Cetaphil',
    category: 'Personal Care',
    rating: 'mixed',
    score: 61,
    summary:
      'Fragrance-free and non-comedogenic, but contains several synthetic emulsifiers flagged at low concern by EWG. Good for sensitive skin with caveats.',
  },
  {
    id: 3,
    name: 'All-Purpose Cleaning Spray',
    brand: 'Method',
    category: 'Home Cleaning',
    rating: 'clean',
    score: 88,
    summary:
      'Plant-based surfactants, no phosphates, biodegradable formula. Light lavender scent derived from essential oils rather than synthetic fragrance.',
  },
  {
    id: 4,
    name: 'Disinfecting Bathroom Cleaner',
    brand: 'Lysol',
    category: 'Home Cleaning',
    rating: 'avoid',
    score: 28,
    summary:
      'Effective at killing 99.9% of bacteria, but contains alkyl dimethyl benzyl ammonium chloride and synthetic fragrance — both flagged as high concern by EWG.',
  },
  {
    id: 5,
    name: 'Gentle Baby Wash & Shampoo',
    brand: 'Babyganics',
    category: 'Baby Care',
    rating: 'clean',
    score: 82,
    summary:
      'Tear-free, hypoallergenic formula with plant-derived cleansers. Free from sulfates, parabens, and phthalates. Safe for newborns and sensitive skin.',
  },
  {
    id: 6,
    name: 'Baby Wipes Fragrance-Free',
    brand: 'The Honest Company',
    category: 'Baby Care',
    rating: 'mixed',
    score: 57,
    summary:
      'Plant-based fibers and a mostly clean ingredient list, but trace preservatives like phenoxyethanol have low-level EWG flags worth noting for daily use.',
  },
]

const CATEGORIES = ['All', 'Personal Care', 'Home Cleaning', 'Baby Care']

// ─── BrowsePage ───────────────────────────────────────────────────────────────

export default function BrowsePage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [savedIds, setSavedIds] = useState(new Set())

  const visibleProducts =
    activeCategory === 'All'
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === activeCategory)

  function toggleSave(id) {
    setSavedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="min-h-screen bg-neutral-50">

      {/* Page header */}
      <div className="max-w-screen-xl mx-auto px-space-lg pt-space-2xl pb-space-xl">
        <h1 className="text-h1 font-cormorant text-neutral-900">Browse Products</h1>
        <p className="text-body font-jost text-neutral-600 mt-space-sm">
          AI-assessed products ranked by ingredient safety. Save the ones worth buying.
        </p>
      </div>

      {/* Category filter row */}
      <div className="max-w-screen-xl mx-auto px-space-lg pb-space-xl">
        <div className="flex flex-wrap gap-space-sm">
          {CATEGORIES.map((cat) => {
            const isActive = cat === activeCategory
            return (
              <span
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={[
                  'inline-flex items-center rounded-radius-sm text-small font-jost px-space-sm py-space-xs cursor-pointer transition-colors duration-150',
                  isActive
                    ? 'bg-primary-dark text-neutral-50'
                    : 'bg-secondary-sage text-neutral-900 hover:bg-primary-light',
                ].join(' ')}
              >
                {cat}
              </span>
            )
          })}
        </div>
      </div>

      {/* Product grid */}
      <div className="max-w-screen-xl mx-auto px-space-lg pb-space-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-lg">
          {visibleProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isSaved={savedIds.has(product.id)}
              onSave={() => toggleSave(product.id)}
            />
          ))}
        </div>
      </div>

    </div>
  )
}

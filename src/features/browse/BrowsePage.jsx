import { useState, useEffect } from 'react'
import ProductCard from '../../components/ProductCard'
import { fetchProducts } from '../../lib/api/products'

const CATEGORIES = ['All', 'Personal Care', 'Home Cleaning', 'Baby Care', 'Kitchen']

// ─── BrowsePage ───────────────────────────────────────────────────────────────

export default function BrowsePage({ onNavigate }) {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeCategory, setActiveCategory] = useState('All')
  const [savedIds, setSavedIds] = useState(new Set())

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [])

  const visibleProducts =
    activeCategory === 'All'
      ? products
      : products.filter((p) => p.category === activeCategory)

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
      <div className="max-w-screen-xl mx-auto px-space-lg pt-space-2xl pb-space-xl flex items-start justify-between gap-space-lg">
        <div>
          <h1 className="text-h1 font-cormorant text-neutral-900">Browse Products</h1>
          <p className="text-body font-jost text-neutral-600 mt-space-sm">
            AI-assessed products ranked by ingredient safety. Save the ones worth buying.
          </p>
        </div>
        <button
          onClick={() => onNavigate('library')}
          className="shrink-0 inline-flex items-center gap-space-xs text-small font-jost text-accent hover:text-accent-light transition-colors duration-150 mt-space-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          Search products
        </button>
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

        {/* Error state */}
        {error && (
          <p className="text-body font-jost text-error">
            Failed to load products: {error}
          </p>
        )}

        {/* Loading skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-lg">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductCard key={i} product={{}} isLoading />
            ))}
          </div>
        )}

        {/* Loaded grid */}
        {!isLoading && !error && (
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
        )}

      </div>
    </div>
  )
}

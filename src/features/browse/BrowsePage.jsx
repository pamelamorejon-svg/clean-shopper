import { useState, useEffect } from 'react'
import ProductCard from '../../components/ProductCard'
import RelatedItemList from './RelatedItemList'
import { fetchProducts } from '../../lib/api/products'
import { fetchSavedProductIds, saveProduct, unsaveProduct } from '../../lib/api/saved-products'

const CATEGORIES = ['All', 'Personal Care', 'Home Cleaning', 'Baby Care', 'Kitchen']

// ─── Breadcrumb ───────────────────────────────────────────────────────────────

function Breadcrumb({ productName, onBack }) {
  return (
    <nav className="flex items-center gap-space-xs text-small font-jost mb-space-xl" aria-label="Breadcrumb">
      <button
        onClick={onBack}
        className="text-accent hover:text-accent-light transition-colors duration-150"
      >
        Browse Products
      </button>
      <span className="text-neutral-400" aria-hidden="true">/</span>
      <span className="text-neutral-600 truncate max-w-xs">{productName}</span>
    </nav>
  )
}

// ─── BrowsePage ───────────────────────────────────────────────────────────────

export default function BrowsePage({ onNavigate, onAddToCart }) {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeCategory, setActiveCategory] = useState('All')
  const [savedIds, setSavedIds] = useState(new Set())
  const [selectedProduct, setSelectedProduct] = useState(null)

  useEffect(() => {
    Promise.all([fetchProducts(), fetchSavedProductIds()])
      .then(([products, savedIds]) => {
        setProducts(products)
        setSavedIds(savedIds)
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [])

  const visibleProducts =
    activeCategory === 'All'
      ? products
      : products.filter((p) => p.category === activeCategory)

  async function toggleSave(id) {
    const isSaved = savedIds.has(id)

    setSavedIds((prev) => {
      const next = new Set(prev)
      isSaved ? next.delete(id) : next.add(id)
      return next
    })

    try {
      isSaved ? await unsaveProduct(id) : await saveProduct(id)
    } catch {
      setSavedIds((prev) => {
        const next = new Set(prev)
        isSaved ? next.add(id) : next.delete(id)
        return next
      })
    }
  }

  // ─── Detail view ────────────────────────────────────────────────────────────
  if (selectedProduct) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-screen-xl mx-auto px-space-lg pt-space-2xl pb-space-2xl">

          <Breadcrumb
            productName={selectedProduct.name}
            onBack={() => setSelectedProduct(null)}
          />

          <div className="max-w-lg">
            <ProductCard
              product={selectedProduct}
              isSaved={savedIds.has(selectedProduct.id)}
              onSave={() => toggleSave(selectedProduct.id)}
              onAddToCart={onAddToCart ? () => onAddToCart(selectedProduct.id) : undefined}
            />
          </div>

          <RelatedItemList
            category={selectedProduct.category}
            excludeProductId={selectedProduct.id}
            onSave={(id) => toggleSave(id)}
            onAddToCart={onAddToCart}
            onViewCategory={(cat) => {
              setActiveCategory(cat)
              setSelectedProduct(null)
            }}
          />

        </div>
      </div>
    )
  }

  // ─── Grid view ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-neutral-50">

      {/* Page header */}
      <div className="max-w-screen-xl mx-auto px-space-lg pt-space-2xl pb-space-xl">
        <h1 className="text-h1 font-cormorant text-neutral-900">Shop Clean</h1>
        <p className="text-body font-jost text-neutral-600 mt-space-sm">
          Clean ingredients, clearly explained. Find products you can feel good about bringing home.
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
                    ? 'bg-accent-light text-neutral-50'
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

        {error && (
          <p className="text-body font-jost text-error">
            Failed to load products: {error}
          </p>
        )}

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-lg">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductCard key={i} product={{}} isLoading />
            ))}
          </div>
        )}

        {!isLoading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-lg">
            {visibleProducts.map((product) => (
              <div
                key={product.id}
                onClick={(e) => {
                  if (e.target.closest('button')) return
                  setSelectedProduct(product)
                }}
                className="cursor-pointer"
              >
                <ProductCard
                  product={product}
                  isSaved={savedIds.has(product.id)}
                  onSave={() => toggleSave(product.id)}
                  onAddToCart={onAddToCart ? () => onAddToCart(product.id) : undefined}
                />
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

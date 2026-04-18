import { useState, useEffect } from 'react'
import ProductCard from '../../components/ProductCard'
import EmptyState from '../../components/EmptyState'
import Button from '../../components/Button'
import { fetchSavedProducts, unsaveProduct, unsaveAll } from '../../lib/api/saved-products'

export default function PreferencesPage({ onNavigate }) {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchSavedProducts()
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [])

  async function handleUnsave(productId) {
    setProducts((prev) => prev.filter((p) => p.id !== productId))
    try {
      await unsaveProduct(productId)
    } catch {
      fetchSavedProducts().then(setProducts).catch(() => {})
    }
  }

  async function handleClearAll() {
    const snapshot = products
    setProducts([])
    try {
      await unsaveAll()
    } catch {
      setProducts(snapshot)
    }
  }

  const itemCount = products.length
  const itemLabel = itemCount === 1 ? '1 product' : `${itemCount} products`

  return (
    <div className="min-h-screen bg-neutral-50">

      {/* Page header */}
      <div className="max-w-screen-xl mx-auto px-space-lg pt-space-2xl pb-space-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-space-sm">
            <h1 className="text-h1 font-cormorant text-neutral-900">Saved Products</h1>
            {!isLoading && itemCount > 0 && (
              <span className="text-body font-jost text-neutral-600">({itemLabel})</span>
            )}
          </div>

          {!isLoading && itemCount > 0 && (
            <Button variant="secondary" size="sm" onClick={handleClearAll}>
              Clear all
            </Button>
          )}
        </div>
        <div className="border-t border-neutral-200 mt-space-xl" />
      </div>

      {/* Content */}
      <div className="max-w-screen-xl mx-auto px-space-lg pb-space-2xl">

        {error && (
          <p className="text-body font-jost text-error">
            Failed to load saved products: {error}
          </p>
        )}

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-lg">
            {Array.from({ length: 3 }).map((_, i) => (
              <ProductCard key={i} product={{}} isLoading />
            ))}
          </div>
        )}

        {!isLoading && !error && itemCount === 0 && (
          <EmptyState
            heading="Nothing saved yet"
            description="Products you save will appear here. Start by browsing products and saving the ones worth buying."
            action={{ label: 'Browse Products', onClick: () => onNavigate('research'), variant: 'primary' }}
          />
        )}

        {!isLoading && !error && itemCount > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-lg">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isSaved
                onSave={() => handleUnsave(product.id)}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

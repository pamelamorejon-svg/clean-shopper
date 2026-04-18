import { useState, useEffect } from 'react'
import CartItem from './CartItem'
import EmptyState from '../../components/EmptyState'
import Button from '../../components/Button'
import { fetchCartProducts, removeFromCart, updateCartQuantity, clearCart } from '../../lib/api/cart'

// ─── CartPage ─────────────────────────────────────────────────────────────────

export default function CartPage({ onNavigate, onCartCountChange }) {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCartProducts()
      .then(({ products }) => setProducts(products))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [])

  // Sync badge count to sum of all quantities
  useEffect(() => {
    const total = products.reduce((sum, p) => sum + (p.quantity ?? 1), 0)
    onCartCountChange?.(total)
  }, [products])

  async function handleRemove(productId) {
    const removed = products.find((p) => p.id === productId)
    setProducts((prev) => prev.filter((p) => p.id !== productId))

    try {
      await removeFromCart(productId)
    } catch {
      setProducts((prev) => [removed, ...prev])
    }
  }

  async function handleQuantityChange(productId, newQty) {
    if (newQty <= 0) return handleRemove(productId)

    // Optimistic update
    setProducts((prev) =>
      prev.map((p) => p.id === productId ? { ...p, quantity: newQty } : p)
    )

    try {
      await updateCartQuantity(productId, newQty)
    } catch {
      // Revert on failure
      setProducts((prev) =>
        prev.map((p) => p.id === productId ? { ...p, quantity: p.quantity } : p)
      )
    }
  }

  async function handleClear() {
    const snapshot = products
    setProducts([])

    try {
      await clearCart()
    } catch {
      setProducts(snapshot)
    }
  }

  // Group products by category, preserving insertion order of first appearance
  const categoryOrder = []
  const grouped = {}
  for (const product of products) {
    if (!grouped[product.category]) {
      grouped[product.category] = []
      categoryOrder.push(product.category)
    }
    grouped[product.category].push(product)
  }

  const totalQty = products.reduce((sum, p) => sum + (p.quantity ?? 1), 0)
  const itemLabel = totalQty === 1 ? '1 item' : `${totalQty} items`

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-screen-xl mx-auto px-space-lg pt-space-2xl pb-space-2xl">

        {/* Page header */}
        <div className="flex items-center justify-between mb-space-xl">
          <div className="flex items-baseline gap-space-sm">
            <h1 className="text-h1 font-cormorant text-neutral-900">Your Cart</h1>
            {!isLoading && (
              <span className="text-body font-jost text-neutral-600">({itemLabel})</span>
            )}
          </div>

          {!isLoading && totalQty > 0 && (
            <Button variant="secondary" size="sm" onClick={handleClear}>
              Clear all
            </Button>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-neutral-200 mb-space-xl" />

        {/* Error */}
        {error && (
          <p className="text-body font-jost text-error mb-space-lg">
            Failed to load cart: {error}
          </p>
        )}

        {/* Loading skeletons */}
        {isLoading && (
          <div className="flex flex-col gap-space-sm">
            {Array.from({ length: 4 }).map((_, i) => (
              <CartItem key={i} product={{}} isLoading />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && totalQty === 0 && (
          <EmptyState
            heading="Your cart is empty"
            description="Add products from the Browse page to build your shopping list."
            action={{
              label: 'Browse Products',
              onClick: () => onNavigate('research'),
              variant: 'primary',
            }}
          />
        )}

        {/* Grouped item list */}
        {!isLoading && !error && totalQty > 0 && (
          <div>
            {categoryOrder.map((category, groupIndex) => (
              <div key={category} className={groupIndex > 0 ? 'mt-space-xl' : ''}>
                <h2 className="text-h4 font-jost text-neutral-900 mb-space-md">
                  {category}
                </h2>
                <div className="flex flex-col gap-space-sm">
                  {grouped[category].map((product) => (
                    <CartItem
                      key={product.id}
                      product={product}
                      onRemove={() => handleRemove(product.id)}
                      onQuantityChange={(newQty) => handleQuantityChange(product.id, newQty)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

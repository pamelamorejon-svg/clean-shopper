import { useState, useEffect } from 'react'
import ProductCard from '../../components/ProductCard'
import EmptyState from '../../components/EmptyState'
import Button from '../../components/Button'
import { fetchRelatedProducts } from '../../lib/api/related-products'

export default function RelatedItemList({
  category,
  excludeProductId,
  onSave,
  onAddToCart,
  onViewCategory,
}) {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!category || !excludeProductId) return

    setIsLoading(true)
    setError(null)

    fetchRelatedProducts(category, excludeProductId)
      .then(setProducts)
      .catch(setError)
      .finally(() => setIsLoading(false))
  }, [category, excludeProductId])

  // Silently suppress on error
  if (error) return null

  return (
    <div className="mt-space-2xl">
      <h2 className="text-h2 font-cormorant text-neutral-900 mb-space-lg">
        Related Products in {category}
      </h2>

      {isLoading ? (
        <div className="flex gap-space-lg overflow-x-auto pb-space-md">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="min-w-card-min">
              <ProductCard product={{}} isLoading />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          heading="No similar products found"
          description="We haven't assessed other products in this category yet. Try searching for an alternative."
        />
      ) : (
        <>
          <div className="flex gap-space-lg overflow-x-auto pb-space-md">
            {products.map((product) => (
              <div key={product.id} className="min-w-card-min">
                <ProductCard
                  product={product}
                  onSave={onSave ? () => onSave(product.id) : undefined}
                  onAddToCart={onAddToCart ? () => onAddToCart(product.id) : undefined}
                />
              </div>
            ))}
          </div>

          {onViewCategory && (
            <div className="mt-space-lg flex justify-start">
              <Button variant="secondary" onClick={() => onViewCategory(category)}>
                See all in {category}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

import SafetyBadge from './SafetyBadge'
import CategoryTag from './CategoryTag'
import Button from './Button'

// ─── Mock ingredient data ──────────────────────────────────────────────────────
const MOCK_INGREDIENTS = {
  clean: [
    { name: 'Water (Aqua)', rating: 'clean' },
    { name: 'Glycerin', rating: 'clean' },
    { name: 'Tocopherol (Vitamin E)', rating: 'clean' },
    { name: 'Aloe Barbadensis Leaf', rating: 'clean' },
    { name: 'Sodium Hyaluronate', rating: 'clean' },
  ],
  mixed: [
    { name: 'Water (Aqua)', rating: 'clean' },
    { name: 'Glycerin', rating: 'clean' },
    { name: 'Phenoxyethanol', rating: 'avoid' },
    { name: 'Tocopherol (Vitamin E)', rating: 'clean' },
    { name: 'Fragrance (Parfum)', rating: 'avoid' },
  ],
  avoid: [
    { name: 'Sodium Lauryl Sulfate', rating: 'avoid' },
    { name: 'Fragrance (Parfum)', rating: 'avoid' },
    { name: 'Parabens (Methylparaben)', rating: 'avoid' },
    { name: 'DMDM Hydantoin', rating: 'avoid' },
    { name: 'Phenoxyethanol', rating: 'avoid' },
  ],
}

// ─── Ingredient hover overlay ──────────────────────────────────────────────────
function IngredientOverlay({ rating }) {
  const ingredients = MOCK_INGREDIENTS[rating] ?? MOCK_INGREDIENTS.clean

  return (
    <div className="absolute inset-0 rounded-radius-md bg-neutral-50/95 p-space-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col gap-space-sm overflow-hidden">
      <p className="text-h4 font-jost text-neutral-900 leading-none">Key Ingredients</p>
      <ul className="flex flex-col gap-space-sm">
        {ingredients.map((ingredient) => (
          <li key={ingredient.name} className="flex items-center justify-between gap-space-sm">
            <span className="text-micro font-jost text-neutral-600 truncate">{ingredient.name}</span>
            <SafetyBadge rating={ingredient.rating} size="sm" />
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonBlock({ className }) {
  return (
    <div className={`bg-neutral-200 rounded-radius-md animate-pulse ${className}`} />
  )
}

function ProductCardSkeleton() {
  return (
    <div className="bg-secondary-cream rounded-radius-lg shadow-sm p-space-lg flex flex-col gap-space-md">
      <SkeletonBlock className="w-full aspect-square" />
      <div className="flex items-center justify-between">
        <SkeletonBlock className="h-6 w-28" />
        <SkeletonBlock className="h-6 w-16 rounded-radius-full" />
      </div>
      <div className="flex flex-col gap-space-xs">
        <SkeletonBlock className="h-8 w-3/4" />
        <SkeletonBlock className="h-4 w-1/3" />
      </div>
      <div className="flex flex-col gap-space-xs">
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-5/6" />
      </div>
      <div className="flex gap-space-sm mt-space-lg">
        <SkeletonBlock className="h-10 flex-1" />
        <SkeletonBlock className="h-10 flex-1" />
      </div>
    </div>
  )
}

// ─── ProductCard ───────────────────────────────────────────────────────────────
export default function ProductCard({
  product,
  isSaved = false,
  onSave,
  onAddToCart,
  isLoading = false,
}) {
  if (isLoading) return <ProductCardSkeleton />

  const { name, brand, category, rating, score, summary, imageUrl } = product
  const hasActions = onSave || onAddToCart

  return (
    <div className="bg-secondary-cream rounded-radius-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-space-lg flex flex-col gap-space-md">

      {/* Product image with ingredient overlay on hover */}
      <div className="relative group">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full aspect-square object-contain rounded-radius-md bg-white p-space-xl"
          />
        ) : (
          <div
            className="w-full aspect-square rounded-radius-md bg-neutral-200"
            aria-hidden="true"
          />
        )}
        <IngredientOverlay rating={rating} />
      </div>

      {/* Category + safety row */}
      <div className="flex items-center justify-between gap-space-sm">
        <CategoryTag label={category} />
        <div className="flex items-center gap-space-xs">
          {score != null && (
            <span className="text-micro font-jost text-neutral-600">
              {score}/100
            </span>
          )}
          <SafetyBadge rating={rating} />
        </div>
      </div>

      {/* Name + brand */}
      <div className="flex flex-col gap-space-xs">
        <h3 className="text-h3 font-cormorant text-neutral-900">{name}</h3>
        {brand && (
          <p className="text-small font-jost text-neutral-600">{brand}</p>
        )}
      </div>

      {/* Summary */}
      <p className="text-body font-jost text-neutral-600">{summary}</p>

      {/* Actions */}
      {hasActions && (
        <div className="flex gap-space-sm mt-space-lg">
          {onSave && (
            <Button variant="secondary" size="sm" onClick={onSave}>
              {isSaved ? 'Saved' : 'Save'}
            </Button>
          )}
          {onAddToCart && (
            <Button variant="primary" size="sm" onClick={onAddToCart}>
              Add to Cart
            </Button>
          )}
        </div>
      )}

    </div>
  )
}

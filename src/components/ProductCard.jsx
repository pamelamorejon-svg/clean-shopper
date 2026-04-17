import SafetyBadge from './SafetyBadge'
import CategoryTag from './CategoryTag'
import Button from './Button'

// ─── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonBlock({ className }) {
  return (
    <div className={`bg-neutral-200 rounded-radius-md animate-pulse ${className}`} />
  )
}

function ProductCardSkeleton() {
  return (
    <div className="bg-secondary-cream rounded-radius-lg shadow-sm p-space-lg flex flex-col gap-space-md">
      <SkeletonBlock className="w-full aspect-video" />
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

      {/* Product image */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          className="w-full aspect-video object-contain rounded-radius-md bg-white p-space-md"
        />
      ) : (
        <div
          className="w-full aspect-video rounded-radius-md bg-neutral-200"
          aria-hidden="true"
        />
      )}

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
            <Button variant="secondary" onClick={onSave}>
              {isSaved ? 'Saved' : 'Save'}
            </Button>
          )}
          {onAddToCart && (
            <Button variant="primary" onClick={onAddToCart}>
              Add to List
            </Button>
          )}
        </div>
      )}

    </div>
  )
}

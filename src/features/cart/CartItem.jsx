import SafetyBadge from '../../components/SafetyBadge'
import CategoryTag from '../../components/CategoryTag'

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CartItemSkeleton() {
  return (
    <div className="flex items-center gap-space-md bg-secondary-cream rounded-radius-md px-space-md py-space-md">
      <div className="w-14 h-14 shrink-0 rounded-radius-sm bg-neutral-200 animate-pulse" />
      <div className="flex flex-col gap-space-xs flex-1">
        <div className="h-5 w-48 bg-neutral-200 rounded-radius-md animate-pulse" />
        <div className="h-4 w-28 bg-neutral-200 rounded-radius-md animate-pulse" />
      </div>
      <div className="flex items-center gap-space-sm shrink-0">
        <div className="h-6 w-24 bg-neutral-200 rounded-radius-sm animate-pulse" />
        <div className="h-5 w-14 bg-neutral-200 rounded-radius-full animate-pulse" />
        <div className="h-7 w-20 bg-neutral-200 rounded-radius-full animate-pulse" />
        <div className="h-5 w-5 bg-neutral-200 rounded-radius-full animate-pulse" />
      </div>
    </div>
  )
}

// ─── CartItem ─────────────────────────────────────────────────────────────────

export default function CartItem({ product, onRemove, onQuantityChange, isLoading = false }) {
  if (isLoading) return <CartItemSkeleton />

  const { name, brand, category, rating, imageUrl, price, quantity = 1 } = product

  return (
    <div className="flex items-center gap-space-md bg-secondary-cream rounded-radius-md px-space-md py-space-md hover:shadow-sm transition-shadow duration-150">

      {/* Thumbnail */}
      <div className="w-14 h-14 shrink-0 rounded-radius-sm overflow-hidden bg-neutral-50 flex items-center justify-center">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-full h-full object-contain p-space-xs" />
        ) : (
          <div className="w-full h-full bg-neutral-100" />
        )}
      </div>

      {/* Name, brand, price */}
      <div className="flex-1 min-w-0">
        <p className="text-h4 font-cormorant text-neutral-900 truncate">{name}</p>
        {brand && (
          <p className="text-micro font-jost text-neutral-600 truncate">{brand}</p>
        )}
        {price != null && (
          <p className="text-small font-jost text-neutral-900 mt-space-xs">
            ${price.toFixed(2)}
          </p>
        )}
      </div>

      {/* Right: category, badge, qty stepper, remove */}
      <div className="flex items-center gap-space-sm shrink-0">
        <CategoryTag label={category} />
        <SafetyBadge rating={rating} size="sm" />

        {/* Quantity stepper */}
        <div className="flex items-center gap-space-xs border border-neutral-200 rounded-radius-full px-space-sm py-space-xs bg-neutral-50">
          <button
            onClick={() => onQuantityChange?.(quantity - 1)}
            aria-label="Decrease quantity"
            className="w-5 h-5 flex items-center justify-center text-neutral-600 hover:text-neutral-900 transition-colors duration-150 focus:outline-none"
          >
            −
          </button>
          <span className="text-small font-jost text-neutral-900 w-5 text-center select-none">
            {quantity}
          </span>
          <button
            onClick={() => onQuantityChange?.(quantity + 1)}
            aria-label="Increase quantity"
            className="w-5 h-5 flex items-center justify-center text-neutral-600 hover:text-neutral-900 transition-colors duration-150 focus:outline-none"
          >
            +
          </button>
        </div>

        {/* Remove */}
        <button
          onClick={onRemove}
          aria-label={`Remove ${name} from cart`}
          className="text-neutral-400 hover:text-error transition-colors duration-150 focus:outline-none ml-space-xs"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
          </svg>
        </button>
      </div>

    </div>
  )
}

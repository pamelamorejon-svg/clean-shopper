const RATING_STYLES = {
  clean: { bg: 'bg-success', label: 'Clean' },
  mixed: { bg: 'bg-warning', label: 'Mixed' },
  avoid: { bg: 'bg-error', label: 'Avoid' },
}

const SIZE_STYLES = {
  md: 'text-small px-space-md py-space-xs',
  sm: 'text-micro px-space-sm py-space-xs',
}

export default function SafetyBadge({ rating, size = 'md' }) {
  const { bg, label } = RATING_STYLES[rating] ?? RATING_STYLES.avoid
  const sizeClasses = SIZE_STYLES[size] ?? SIZE_STYLES.md

  return (
    <span
      className={`inline-flex items-center rounded-radius-full font-jost font-medium text-white ${bg} ${sizeClasses}`}
    >
      {label}
    </span>
  )
}

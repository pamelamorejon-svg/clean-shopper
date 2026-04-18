const RATING_STYLES = {
  clean: { bg: 'bg-success', text: 'text-white', label: 'Clean' },
  mixed: { bg: 'bg-primary-dark', text: 'text-white', label: 'Mixed' },
  avoid: { bg: 'bg-highlight', text: 'text-white', label: 'Caution' },
}

const SIZE_STYLES = {
  md: 'text-small px-space-md py-space-xs',
  sm: 'text-micro px-space-sm py-space-xs',
}

export default function SafetyBadge({ rating, size = 'md' }) {
  const { bg, text, label } = RATING_STYLES[rating] ?? RATING_STYLES.avoid
  const sizeClasses = SIZE_STYLES[size] ?? SIZE_STYLES.md

  return (
    <span
      className={`inline-flex items-center rounded-radius-full font-jost font-medium ${bg} ${text} ${sizeClasses}`}
    >
      {label}
    </span>
  )
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4 shrink-0"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

const VARIANT_STYLES = {
  primary:
    'bg-accent text-white hover:bg-accent-light active:bg-accent disabled:opacity-40 disabled:cursor-not-allowed',
  secondary:
    'bg-transparent border border-accent text-accent hover:bg-secondary-sage active:bg-secondary-sage disabled:opacity-40 disabled:cursor-not-allowed',
}

const SIZE_STYLES = {
  md: 'px-space-lg py-space-md',
  sm: 'px-space-md py-space-sm',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  type = 'button',
  disabled = false,
  isLoading = false,
  fullWidth = false,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={[
        'inline-flex items-center justify-center gap-space-sm',
        'rounded-radius-md text-small font-jost font-medium',
        SIZE_STYLES[size] ?? SIZE_STYLES.md,
        'transition-colors duration-150 focus:outline-none',
        VARIANT_STYLES[variant] ?? VARIANT_STYLES.primary,
        fullWidth ? 'w-full' : '',
      ].join(' ')}
    >
      {isLoading && <Spinner />}
      {children}
    </button>
  )
}

import Button from './Button'

export default function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = "Search for a product or describe what you're looking for…",
  isLoading = false,
}) {
  function handleKeyDown(e) {
    if (e.key === 'Enter' && !isLoading) {
      onSubmit()
    }
  }

  return (
    <div className="flex items-center gap-space-sm w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isLoading}
        className="flex-1 bg-neutral-100 border border-neutral-200 rounded-radius-md px-space-md py-space-md text-body font-jost text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-primary-dark focus:shadow-md transition-shadow duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <Button variant="primary" onClick={onSubmit} isLoading={isLoading}>
        Search
      </Button>
    </div>
  )
}

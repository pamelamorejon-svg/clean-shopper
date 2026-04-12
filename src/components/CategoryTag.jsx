export default function CategoryTag({ label, onClick }) {
  const base =
    'inline-flex items-center rounded-radius-sm bg-secondary-sage text-small font-jost text-neutral-900 px-space-sm py-space-xs'
  const interactive = onClick
    ? 'cursor-pointer hover:bg-primary-light transition-colors duration-150'
    : ''

  return (
    <span className={`${base} ${interactive}`} onClick={onClick}>
      {label}
    </span>
  )
}

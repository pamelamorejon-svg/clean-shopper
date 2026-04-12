const TABS = [
  { key: 'research', label: 'Home' },
  { key: 'library', label: 'My Products' },
  { key: 'cart', label: 'Cart' },
  { key: 'preferences', label: 'Preferences' },
]

export default function NavBar({ activeTab, onTabChange, cartCount = 0 }) {
  return (
    <nav className="w-full bg-neutral-50 border-b border-neutral-200 px-space-2xl py-space-md flex items-center justify-between">

      {/* Wordmark */}
      <span className="text-h4 font-cormorant text-neutral-900 tracking-wide">
        Clean Shopper
      </span>

      {/* Tab list */}
      <ul className="flex items-center gap-space-xl list-none m-0 p-0">
        {TABS.map(({ key, label }) => {
          const isActive = activeTab === key

          return (
            <li key={key}>
              <button
                onClick={() => onTabChange(key)}
                className={[
                  'flex items-center text-small font-jost cursor-pointer',
                  'pb-space-xs border-b-2 transition-colors duration-150',
                  'bg-transparent border-x-0 border-t-0 focus:outline-none',
                  isActive
                    ? 'text-accent border-accent'
                    : 'text-neutral-600 border-transparent hover:text-neutral-900',
                ].join(' ')}
              >
                {label}

                {/* Cart item count badge */}
                {key === 'cart' && cartCount > 0 && (
                  <span className="ml-space-xs bg-accent text-white text-micro font-jost rounded-radius-full px-space-sm py-space-xs leading-none">
                    {cartCount}
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>

    </nav>
  )
}

const TABS = [
  { key: 'library', label: 'Search' },
  { key: 'preferences', label: 'Saved' },
  { key: 'cart', label: 'Cart' },
]

export default function NavBar({ activeTab, onTabChange, onHome, cartCount = 0, onSignOut }) {
  return (
    <nav className="w-full bg-neutral-50 border-b border-neutral-200 py-space-md">
      <div className="max-w-screen-xl mx-auto px-space-lg flex items-center justify-between">

        {/* Wordmark — navigates home */}
        <button
          onClick={onHome}
          className="text-h4 font-jost font-normal text-neutral-900 tracking-wide hover:text-neutral-600 transition-colors duration-150 focus:outline-none"
        >
          Clean Shopper
        </button>

        {/* Tab list + sign out */}
        <div className="flex items-center gap-space-xl">
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

          {/* Sign out */}
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="text-small font-jost text-neutral-400 hover:text-neutral-900 transition-colors duration-150 focus:outline-none pb-space-xs border-b-2 border-transparent"
            >
              Sign out
            </button>
          )}
        </div>

      </div>
    </nav>
  )
}

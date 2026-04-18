import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { signOut } from './lib/api/auth'
import {
  fetchCartProducts,
  addToCart as addToCartAPI,
} from './lib/api/cart'
import NavBar from './components/NavBar'
import BrowsePage from './features/browse/BrowsePage'
import SearchPage from './features/search/SearchPage'
import ChatPage from './features/chat/ChatPage'
import CartPage from './features/cart/CartPage'
import PreferencesPage from './features/preferences/PreferencesPage'
import SignInPage from './features/auth/SignInPage'
import SignUpPage from './features/auth/SignUpPage'

// ─── Search header overlay ────────────────────────────────────────────────────

function SearchOverlay({ onClose, onSubmit }) {
  const [query, setQuery] = useState('')

  function handleSubmit() {
    const term = query.trim()
    if (!term) return
    onSubmit(term)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSubmit()
    if (e.key === 'Escape') onClose()
  }

  return (
    <div className="w-full bg-neutral-50 border-b border-neutral-200 py-space-md">
      <div className="max-w-screen-xl mx-auto px-space-lg flex items-center gap-space-md">
        <div className="flex-1 flex items-center gap-space-sm border border-neutral-200 rounded-radius-full bg-white px-space-lg py-space-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-neutral-400" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search for a product or keyword…"
            className="flex-1 bg-transparent text-body font-jost text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
          />
        </div>
        <button
          onClick={onClose}
          aria-label="Close search"
          className="shrink-0 text-neutral-400 hover:text-neutral-900 transition-colors duration-150 focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [session, setSession] = useState(undefined)
  const [activeTab, setActiveTab] = useState('research')
  const [previousTab, setPreviousTab] = useState('research')
  const [authView, setAuthView] = useState('signin')
  const [cartCount, setCartCount] = useState(0)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [pendingQuery, setPendingQuery] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Load initial cart count from Supabase once session is available
  useEffect(() => {
    if (!session) return
    fetchCartProducts()
      .then(({ totalQuantity }) => setCartCount(totalQuantity))
      .catch(() => {}) // silently fail if cart_items table doesn't exist yet
  }, [session])

  if (session === undefined) return null

  if (!session) {
    return authView === 'signin'
      ? <SignInPage onNavigateToSignUp={() => setAuthView('signup')} />
      : <SignUpPage onNavigateToSignIn={() => setAuthView('signin')} />
  }

  async function addToCart(productId) {
    setCartCount((prev) => prev + 1) // optimistic
    try {
      await addToCartAPI(productId)
    } catch {
      setCartCount((prev) => prev - 1) // revert
    }
  }

  function handleTabChange(tab) {
    if (tab === 'library') {
      setIsSearchOpen(true)
      return
    }
    setIsSearchOpen(false)
    setActiveTab(tab)
  }

  function handleChatToggle() {
    if (activeTab === 'chat') {
      setActiveTab(previousTab)
    } else {
      setPreviousTab(activeTab)
      setActiveTab('chat')
    }
  }

  function handleSearchSubmit(term) {
    setPendingQuery(term)
    setIsSearchOpen(false)
    setActiveTab('library')
  }

  return (
    <div className="h-screen flex flex-col bg-neutral-50">

      {isSearchOpen ? (
        <SearchOverlay
          onClose={() => setIsSearchOpen(false)}
          onSubmit={handleSearchSubmit}
        />
      ) : (
        <NavBar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onHome={() => { setIsSearchOpen(false); setActiveTab('research') }}
          cartCount={cartCount}
          onSignOut={signOut}
        />
      )}

      {activeTab === 'research' && (
        <div className="flex-1 overflow-y-auto">
          <BrowsePage onNavigate={setActiveTab} onAddToCart={addToCart} />
        </div>
      )}
      {activeTab === 'library' && (
        <div className="flex-1 overflow-y-auto">
          <SearchPage
            onNavigate={setActiveTab}
            initialQuery={pendingQuery}
            onQueryConsumed={() => setPendingQuery('')}
          />
        </div>
      )}
      {activeTab === 'chat' && <ChatPage />}
      {activeTab === 'cart' && (
        <div className="flex-1 overflow-y-auto">
          <CartPage
            onNavigate={setActiveTab}
            onCartCountChange={setCartCount}
          />
        </div>
      )}
      {activeTab === 'preferences' && (
        <div className="flex-1 overflow-y-auto">
          <PreferencesPage onNavigate={setActiveTab} />
        </div>
      )}

      {/* Floating Ask AI button */}
      <button
        onClick={handleChatToggle}
        aria-label={activeTab === 'chat' ? 'Close Ask AI' : 'Ask AI'}
        className="fixed bottom-space-2xl right-space-lg z-50 bg-accent hover:bg-accent-light text-white rounded-radius-full p-space-md shadow-lg transition-colors duration-150 focus:outline-none"
      >
        {activeTab === 'chat' ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        )}
      </button>
    </div>
  )
}

import { useState, useEffect, useRef } from 'react'
import SearchBar from '../../components/SearchBar'
import ProductCard from '../../components/ProductCard'
import { searchProducts } from '../../lib/api/products'
import { fetchSavedProductIds, saveProduct, unsaveProduct } from '../../lib/api/saved-products'

// ─── States ───────────────────────────────────────────────────────────────────

function IdleState() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-space-2xl px-space-lg gap-space-lg">
      <p className="text-body font-jost text-neutral-400">
        Search for a product by name, brand, or keyword to get started.
      </p>
    </div>
  )
}

function EmptyState({ query }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-space-2xl px-space-lg gap-space-lg">
      <h2 className="text-h3 font-cormorant text-neutral-900">No results found</h2>
      <p className="text-body font-jost text-neutral-600 max-w-sm">
        No products matched <span className="font-medium">"{query}"</span>. Try a different name, brand, or ingredient keyword.
      </p>
    </div>
  )
}

function ErrorState({ message }) {
  return (
    <p className="text-body font-jost text-error py-space-xl text-center">
      Something went wrong: {message}
    </p>
  )
}

// ─── SearchPage ───────────────────────────────────────────────────────────────

export default function SearchPage({ onNavigate }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [savedIds, setSavedIds] = useState(new Set())
  const [submittedQuery, setSubmittedQuery] = useState('')
  const hasSearched = submittedQuery.length > 0
  const abortRef = useRef(null)

  // Load saved state once on mount
  useEffect(() => {
    fetchSavedProductIds().then(setSavedIds).catch(() => {})
  }, [])

  async function handleSubmit() {
    const term = query.trim()
    if (!term) return

    if (abortRef.current) abortRef.current = false

    setSubmittedQuery(term)
    setIsLoading(true)
    setError(null)
    setResults([])

    let cancelled = false
    abortRef.current = () => { cancelled = true }

    try {
      const data = await searchProducts(term)
      if (!cancelled) setResults(data)
    } catch (err) {
      if (!cancelled) setError(err.message)
    } finally {
      if (!cancelled) setIsLoading(false)
    }
  }

  async function toggleSave(id) {
    const isSaved = savedIds.has(id)

    // Optimistic update
    setSavedIds((prev) => {
      const next = new Set(prev)
      isSaved ? next.delete(id) : next.add(id)
      return next
    })

    try {
      isSaved ? await unsaveProduct(id) : await saveProduct(id)
    } catch {
      // Revert on failure
      setSavedIds((prev) => {
        const next = new Set(prev)
        isSaved ? next.add(id) : next.delete(id)
        return next
      })
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">

      {/* Page header */}
      <div className="max-w-screen-xl mx-auto px-space-lg pt-space-2xl pb-space-xl">
        <button
          onClick={() => onNavigate('research')}
          className="inline-flex items-center gap-space-xs text-small font-jost text-neutral-600 hover:text-neutral-900 transition-colors duration-150 mb-space-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Browse all products
        </button>
        <h1 className="text-h1 font-cormorant text-neutral-900">Search Products</h1>
        <p className="text-body font-jost text-neutral-600 mt-space-sm">
          Search by product name, brand, or keyword — like "soap," "fragrance-free," or "zinc oxide."
        </p>
      </div>

      {/* Search bar */}
      <div className="max-w-screen-xl mx-auto px-space-lg pb-space-xl">
        <SearchBar
          value={query}
          onChange={setQuery}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          placeholder="Search for a product or keyword…"
        />
      </div>

      {/* Results area */}
      <div className="max-w-screen-xl mx-auto px-space-lg pb-space-2xl">

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-lg">
            {Array.from({ length: 3 }).map((_, i) => (
              <ProductCard key={i} product={{}} isLoading />
            ))}
          </div>
        )}

        {!isLoading && error && <ErrorState message={error} />}

        {!isLoading && !error && hasSearched && results.length === 0 && (
          <EmptyState query={submittedQuery} />
        )}

        {!isLoading && !error && results.length > 0 && (
          <>
            <p className="text-small font-jost text-neutral-600 mb-space-lg">
              {results.length} {results.length === 1 ? 'result' : 'results'} for{' '}
              <span className="font-medium">"{submittedQuery}"</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-lg">
              {results.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isSaved={savedIds.has(product.id)}
                  onSave={() => toggleSave(product.id)}
                />
              ))}
            </div>
          </>
        )}

        {!isLoading && !hasSearched && <IdleState />}

      </div>
    </div>
  )
}

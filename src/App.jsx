import { useState } from 'react'
import NavBar from './components/NavBar'
import ProductCard from './components/ProductCard'
import SearchBar from './components/SearchBar'

const sampleProduct = {
  name: "Dr. Bronner's Pure Castile Soap",
  brand: "Dr. Bronner's",
  category: 'Personal Care',
  rating: 'clean',
  score: 92,
  summary: 'Organic, fair trade, no synthetic preservatives or detergents.',
}

export default function App() {
  const [activeTab, setActiveTab] = useState('research')
  const [isSaved, setIsSaved] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)

  return (
    <div className="min-h-screen bg-neutral-50">

      {/* NavBar — full width, top of every view */}
      <NavBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        cartCount={cartCount}
      />

      {/* Page content */}
      <div className="max-w-xl mx-auto py-space-2xl px-space-lg flex flex-col gap-space-2xl">

        {/* Section header */}
        <div className="flex flex-col gap-space-sm">
          <h1 className="text-h2 font-cormorant text-neutral-900">
            Component Preview
          </h1>
          <p className="text-body font-jost text-neutral-600">
            Click the nav tabs to switch active state. Save or add to list to
            see interactive states on the card.
          </p>
        </div>

        {/* SearchBar — default */}
        <div className="flex flex-col gap-space-md">
          <h2 className="text-h4 font-jost text-neutral-600">SearchBar</h2>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={() => {
              setSearchLoading(true)
              setTimeout(() => setSearchLoading(false), 2000)
            }}
            isLoading={searchLoading}
          />
        </div>

        {/* ProductCard — interactive */}
        <div className="flex flex-col gap-space-md">
          <h2 className="text-h4 font-jost text-neutral-600">ProductCard</h2>
          <ProductCard
            product={sampleProduct}
            isSaved={isSaved}
            onSave={() => setIsSaved((prev) => !prev)}
            onAddToCart={() => setCartCount((n) => n + 1)}
          />
        </div>

        {/* ProductCard — loading skeleton */}
        <div className="flex flex-col gap-space-md">
          <h2 className="text-h4 font-jost text-neutral-600">
            ProductCard — loading skeleton
          </h2>
          <ProductCard product={sampleProduct} isLoading />
        </div>

      </div>
    </div>
  )
}

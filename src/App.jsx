import { useState } from 'react'
import NavBar from './components/NavBar'
import BrowsePage from './features/browse/BrowsePage'

export default function App() {
  const [activeTab, setActiveTab] = useState('research')
  const [cartCount, setCartCount] = useState(0)

  return (
    <div className="min-h-screen bg-neutral-50">
      <NavBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        cartCount={cartCount}
      />
      <BrowsePage />
    </div>
  )
}

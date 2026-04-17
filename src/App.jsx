import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { signOut } from './lib/api/auth'
import NavBar from './components/NavBar'
import BrowsePage from './features/browse/BrowsePage'
import SearchPage from './features/search/SearchPage'
import ChatPage from './features/chat/ChatPage'
import SignInPage from './features/auth/SignInPage'
import SignUpPage from './features/auth/SignUpPage'

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = loading
  const [activeTab, setActiveTab] = useState('research')
  const [authView, setAuthView] = useState('signin') // 'signin' | 'signup'
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Still loading initial session
  if (session === undefined) return null

  // Not signed in — show auth pages
  if (!session) {
    return authView === 'signin'
      ? <SignInPage onNavigateToSignUp={() => setAuthView('signup')} />
      : <SignUpPage onNavigateToSignIn={() => setAuthView('signin')} />
  }

  // Signed in — show main app
  return (
    <div className="h-screen flex flex-col bg-neutral-50">
      <NavBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        cartCount={cartCount}
        onSignOut={signOut}
      />
      {activeTab === 'research' && (
        <div className="flex-1 overflow-y-auto">
          <BrowsePage onNavigate={setActiveTab} />
        </div>
      )}
      {activeTab === 'library' && (
        <div className="flex-1 overflow-y-auto">
          <SearchPage onNavigate={setActiveTab} />
        </div>
      )}
      {activeTab === 'chat' && <ChatPage />}
    </div>
  )
}

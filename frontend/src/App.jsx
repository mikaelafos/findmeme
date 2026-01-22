import { useState, useEffect } from 'react'
import MemeGrid from './components/MemeGrid'
import SearchBar from './components/SearchBar'
import UploadForm from './components/UploadForm'
import AuthModal from './components/AuthModal'
import Favorites from './pages/Favorites'
import AdminPanel from './pages/AdminPanel'

function App() {
  const [memes, setMemes] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [currentView, setCurrentView] = useState('home') // 'home', 'favorites', or 'admin'

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (token && savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  // Fetch memes from backend
  const fetchMemes = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (filterType) params.append('type', filterType)

      const response = await fetch(`/api/memes?${params}`)
      const data = await response.json()
      setMemes(data)
    } catch (error) {
      console.error('Error fetching memes:', error)
    }
    setLoading(false)
  }

  // Fetch memes on component mount and when search/filter changes
  useEffect(() => {
    fetchMemes()
  }, [searchTerm, filterType])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setShowUpload(false)
    setCurrentView('home')
  }

  return (
    <div className="min-h-screen">
      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={(user) => setUser(user)}
        />
      )}

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Left: Favorites or Admin */}
            <div className="flex items-center gap-3 sm:gap-4">
              {user && (
                <button
                  onClick={() => setCurrentView('favorites')}
                  className={`text-lg sm:text-xl font-serif italic transition ${
                    currentView === 'favorites'
                      ? 'text-gray-900 underline'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  favorites
                </button>
              )}
              {user?.isAdmin && (
                <button
                  onClick={() => setCurrentView('admin')}
                  className={`text-lg sm:text-xl font-serif italic transition ${
                    currentView === 'admin'
                      ? 'text-gray-900 underline'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  admin
                </button>
              )}
            </div>
            {!user && <div className="w-20"></div>}

            {/* Center: FindMeme logo */}
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-serif italic cursor-pointer transition hover:opacity-70 absolute left-1/2 transform -translate-x-1/2"
              onClick={() => setCurrentView('home')}
            >
              findmeme
            </h1>

            {/* Right: Login/Logout */}
            <div className="flex items-center gap-2 sm:gap-3">
              {user ? (
                <>
                  {currentView === 'home' && (
                    <button
                      onClick={() => setShowUpload(!showUpload)}
                      className="text-sm sm:text-base text-gray-600 hover:text-gray-900 transition hidden sm:block"
                    >
                      {showUpload ? 'close' : 'upload'}
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="text-lg sm:text-xl font-serif italic text-gray-600 hover:text-gray-900 transition"
                  >
                    logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="text-lg sm:text-xl font-serif italic text-gray-600 hover:text-gray-900 transition"
                >
                  login
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {currentView === 'home' ? (
          <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Upload Form */}
            {showUpload && (
              <div className="mb-8">
                <UploadForm
                  onUploadSuccess={() => {
                    setShowUpload(false)
                    fetchMemes()
                  }}
                />
              </div>
            )}

            {/* Search and Filter */}
            <SearchBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              filterType={filterType}
              onFilterChange={setFilterType}
            />

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12 animate-fadeIn">
                <div className="spinner mx-auto mb-4"></div>
                <p className="text-white text-lg font-medium">Loading memes...</p>
              </div>
            )}

            {/* Empty State */}
            {!loading && memes.length === 0 && (
              <div className="text-center py-12 animate-fadeIn">
                <div className="glass p-12 rounded-2xl max-w-md mx-auto">
                  <div className="text-6xl mb-4">🎭</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No memes found</h3>
                  <p className="text-gray-600">
                    {searchTerm || filterType
                      ? 'Try adjusting your search or filters'
                      : 'Upload some memes to get started!'}
                  </p>
                </div>
              </div>
            )}

            {!loading && memes.length > 0 && (
              <MemeGrid memes={memes} onDelete={fetchMemes} />
            )}
          </div>
        ) : currentView === 'favorites' ? (
          <Favorites />
        ) : (
          <AdminPanel />
        )}
      </main>
    </div>
  )
}

export default App

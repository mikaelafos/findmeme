import { useState, useEffect } from 'react'
import MemeGrid from './components/MemeGrid'
import SearchBar from './components/SearchBar'
import UploadForm from './components/UploadForm'
import AuthModal from './components/AuthModal'
import Favorites from './pages/Favorites'

function App() {
  const [memes, setMemes] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [currentView, setCurrentView] = useState('home') // 'home' or 'favorites'

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
    <div className="min-h-screen bg-gray-100">
      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={(user) => setUser(user)}
        />
      )}

      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h1
                className="text-3xl font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition"
                onClick={() => setCurrentView('home')}
              >
                FindMeme
              </h1>

              {/* Navigation */}
              <nav className="flex gap-4">
                <button
                  onClick={() => setCurrentView('home')}
                  className={`px-3 py-2 rounded-lg transition ${
                    currentView === 'home'
                      ? 'bg-blue-100 text-blue-700 font-semibold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Browse
                </button>
                {user && (
                  <button
                    onClick={() => setCurrentView('favorites')}
                    className={`px-3 py-2 rounded-lg transition ${
                      currentView === 'favorites'
                        ? 'bg-blue-100 text-blue-700 font-semibold'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    My Favorites
                  </button>
                )}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <span className="text-gray-700">Welcome, {user.username}!</span>
                  {currentView === 'home' && (
                    <button
                      onClick={() => setShowUpload(!showUpload)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                    >
                      {showUpload ? 'Close Upload' : 'Upload Meme'}
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Login / Sign Up
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
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">Loading memes...</p>
              </div>
            )}

            {/* Meme Grid */}
            {!loading && memes.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">
                  No memes found. Upload some to get started!
                </p>
              </div>
            )}

            {!loading && memes.length > 0 && (
              <MemeGrid memes={memes} onDelete={fetchMemes} />
            )}
          </div>
        ) : (
          <Favorites />
        )}
      </main>
    </div>
  )
}

export default App

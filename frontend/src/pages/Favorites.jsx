import { useState, useEffect } from 'react'
import MemeGrid from '../components/MemeGrid'

function Favorites() {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchFavorites()
  }, [])

  const fetchFavorites = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('token')

      if (!token) {
        setError('Please log in to view your favorites')
        setLoading(false)
        return
      }

      const response = await fetch('/api/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch favorites')
      }

      const data = await response.json()
      setFavorites(data)
    } catch (error) {
      console.error('Error fetching favorites:', error)
      setError('Failed to load favorites. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">My Favorites</h2>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">Loading your favorites...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-600 text-lg">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && favorites.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="w-16 h-16 mx-auto text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
          <p className="text-gray-600 text-lg">No favorites yet!</p>
          <p className="text-gray-500 mt-2">
            Start favoriting memes by clicking the heart icon on any meme card.
          </p>
        </div>
      )}

      {/* Favorites Grid */}
      {!loading && !error && favorites.length > 0 && (
        <MemeGrid memes={favorites} onDelete={fetchFavorites} />
      )}
    </div>
  )
}

export default Favorites

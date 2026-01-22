import { useState, useEffect } from 'react'

function MemeCard({ meme, onDelete }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)

    // If logged in, check if this meme is favorited
    if (token) {
      checkFavoriteStatus()
    }
  }, [])

  const checkFavoriteStatus = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/favorites/check/${meme.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setIsFavorited(data.isFavorited)
    } catch (error) {
      console.error('Error checking favorite status:', error)
    }
  }

  const handleFavoriteToggle = async () => {
    if (!isLoggedIn) {
      alert('Please log in to favorite memes!')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const method = isFavorited ? 'DELETE' : 'POST'

      await fetch(`/api/favorites/${meme.id}`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      setIsFavorited(!isFavorited)
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const handleDelete = async () => {
    try {
      await fetch(`/api/memes/${meme.id}`, {
        method: 'DELETE',
      })
      onDelete()
    } catch (error) {
      console.error('Error deleting meme:', error)
    }
  }

  return (
    <div className="glass rounded-2xl overflow-hidden card-hover animate-fadeIn">
      {/* Media */}
      <div className="aspect-square bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center relative group">
        {meme.media_type === 'video' ? (
          <video
            src={meme.media_url}
            controls
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={meme.media_url}
            alt={meme.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}

        {/* Favorite Heart Button */}
        {isLoggedIn && (
          <button
            onClick={handleFavoriteToggle}
            className={`absolute top-3 right-3 p-2.5 rounded-full shadow-lg transition-all transform hover:scale-110 ${
              isFavorited
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'glass-dark text-white hover:bg-white/30'
            }`}
            title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg
              className={`w-5 h-5 ${isFavorited ? 'fill-current' : 'fill-none'}`}
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
          </button>
        )}

        {/* Media Type Badge */}
        <div className="absolute bottom-3 left-3">
          <span className="glass-dark px-3 py-1 rounded-full text-xs font-semibold text-white backdrop-blur-md">
            {meme.media_type === 'video' ? '🎥 Video' : '🖼️ Image'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-gray-900 mb-3 text-lg line-clamp-2">{meme.title}</h3>

        {/* Tags */}
        {meme.tags && meme.tags[0] && (
          <div className="flex flex-wrap gap-2 mb-4">
            {meme.tags.map((tag, index) => (
              tag && (
                <span
                  key={index}
                  className="tag"
                >
                  #{tag}
                </span>
              )
            ))}
          </div>
        )}

        {/* Delete Button */}
        <div className="flex items-center justify-end">
          {showConfirm ? (
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                className="text-xs bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition font-medium"
              >
                ✓ Confirm
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="text-xs bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                ✕ Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirm(true)}
              className="text-sm text-red-500 hover:text-red-700 font-medium transition"
            >
              🗑️ Delete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default MemeCard

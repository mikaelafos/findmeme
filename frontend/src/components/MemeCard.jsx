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
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
      {/* Media */}
      <div className="aspect-square bg-gray-200 flex items-center justify-center relative">
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
            className="w-full h-full object-cover"
          />
        )}

        {/* Favorite Heart Button */}
        {isLoggedIn && (
          <button
            onClick={handleFavoriteToggle}
            className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white rounded-full shadow-md transition"
            title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg
              className={`w-6 h-6 ${isFavorited ? 'fill-red-500 text-red-500' : 'fill-none text-gray-600'}`}
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
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2">{meme.title}</h3>

        {/* Tags */}
        {meme.tags && meme.tags[0] && (
          <div className="flex flex-wrap gap-2 mb-3">
            {meme.tags.map((tag, index) => (
              tag && (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                >
                  {tag}
                </span>
              )
            ))}
          </div>
        )}

        {/* Type Badge */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 uppercase">{meme.media_type}</span>

          {/* Delete Button */}
          {showConfirm ? (
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="text-xs bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirm(true)}
              className="text-xs text-red-600 hover:text-red-800"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default MemeCard

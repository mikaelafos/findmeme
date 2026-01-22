import { useState, useEffect } from 'react'

function AdminPanel() {
  const [pendingMemes, setPendingMemes] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPendingMemes()
    fetchStats()
  }, [])

  const fetchPendingMemes = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/pending-memes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setPendingMemes(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching pending memes:', error)
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem('token')
      await fetch(`/api/admin/approve-meme/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      fetchPendingMemes()
      fetchStats()
    } catch (error) {
      console.error('Error approving meme:', error)
    }
  }

  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem('token')
      await fetch(`/api/admin/reject-meme/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      fetchPendingMemes()
      fetchStats()
    } catch (error) {
      console.error('Error rejecting meme:', error)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-gray-600">Loading admin panel...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl sm:text-3xl font-serif italic mb-6">admin panel</h2>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-200 p-4">
            <div className="text-2xl font-bold">{stats.pending_count}</div>
            <div className="text-sm text-gray-600 font-serif italic">pending</div>
          </div>
          <div className="bg-white border border-gray-200 p-4">
            <div className="text-2xl font-bold">{stats.approved_count}</div>
            <div className="text-sm text-gray-600 font-serif italic">approved</div>
          </div>
          <div className="bg-white border border-gray-200 p-4">
            <div className="text-2xl font-bold">{stats.rejected_count}</div>
            <div className="text-sm text-gray-600 font-serif italic">rejected</div>
          </div>
          <div className="bg-white border border-gray-200 p-4">
            <div className="text-2xl font-bold">{stats.total_users}</div>
            <div className="text-sm text-gray-600 font-serif italic">users</div>
          </div>
        </div>
      )}

      {/* Pending Memes */}
      <h3 className="text-xl font-serif italic mb-4">pending submissions ({pendingMemes.length})</h3>

      {pendingMemes.length === 0 ? (
        <div className="bg-white border border-gray-200 p-8 text-center">
          <p className="text-gray-600 font-serif italic">no pending submissions</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingMemes.map((meme) => (
            <div key={meme.id} className="bg-white border border-gray-200">
              {/* Meme Image/Video */}
              <div className="aspect-square bg-gray-100">
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
              </div>

              {/* Meme Info */}
              <div className="p-4">
                <h4 className="font-bold mb-2">{meme.title}</h4>
                <p className="text-sm text-gray-600 mb-2 font-serif italic">
                  by {meme.submitted_by || 'anonymous'}
                </p>
                {meme.tags && meme.tags[0] && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {meme.tags.map((tag, i) => (
                      tag && (
                        <span key={i} className="text-xs border border-gray-300 px-2 py-1">
                          {tag}
                        </span>
                      )
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(meme.id)}
                    className="flex-1 bg-gray-900 text-white py-2 hover:bg-gray-700 transition font-serif italic text-sm"
                  >
                    approve
                  </button>
                  <button
                    onClick={() => handleReject(meme.id)}
                    className="flex-1 border border-gray-900 text-gray-900 py-2 hover:bg-gray-100 transition font-serif italic text-sm"
                  >
                    reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminPanel

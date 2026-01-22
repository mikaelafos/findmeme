import { useState } from 'react'

function UploadForm({ onUploadSuccess }) {
  const [title, setTitle] = useState('')
  const [mediaType, setMediaType] = useState('image')
  const [tags, setTags] = useState('')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('media_type', mediaType)
      formData.append('tags', tags)
      if (file) {
        formData.append('file', file)
      }

      const response = await fetch('/api/memes', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        // Reset form
        setTitle('')
        setMediaType('image')
        setTags('')
        setFile(null)
        onUploadSuccess()
      } else {
        console.error('Upload failed')
      }
    } catch (error) {
      console.error('Error uploading meme:', error)
    }

    setUploading(false)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Upload New Meme</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Give your meme a title"
          />
        </div>

        {/* Media Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Media Type *
          </label>
          <select
            value={mediaType}
            onChange={(e) => setMediaType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="image">Image</option>
            <option value="gif">GIF</option>
            <option value="video">Video</option>
          </select>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="funny, cat, reaction"
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            File (optional - using placeholder for now)
          </label>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Note: Cloudinary integration coming soon. For now, memes will use a placeholder image.
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition disabled:bg-gray-400"
        >
          {uploading ? 'Uploading...' : 'Upload Meme'}
        </button>
      </form>
    </div>
  )
}

export default UploadForm

function SearchBar({ searchTerm, onSearchChange, filterType, onFilterChange }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Search Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Memes
          </label>
          <input
            type="text"
            placeholder="Search by title or tags..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filter by Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Type
          </label>
          <select
            value={filterType}
            onChange={(e) => onFilterChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="image">Images</option>
            <option value="gif">GIFs</option>
            <option value="video">Videos</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default SearchBar

function SearchBar({ searchTerm, onSearchChange, filterType, onFilterChange }) {
  return (
    <div className="glass rounded-2xl p-6 mb-8 shadow-xl animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Search Input */}
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span>🔍</span>
            <span>Search Memes</span>
          </label>
          <input
            type="text"
            placeholder="Search by title or tags..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent transition bg-white shadow-sm"
          />
        </div>

        {/* Filter by Type */}
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span>🎬</span>
            <span>Filter by Type</span>
          </label>
          <select
            value={filterType}
            onChange={(e) => onFilterChange(e.target.value)}
            className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent transition bg-white shadow-sm"
          >
            <option value="">🌟 All Types</option>
            <option value="image">🖼️ Images</option>
            <option value="gif">✨ GIFs</option>
            <option value="video">🎥 Videos</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default SearchBar

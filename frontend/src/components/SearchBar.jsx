function SearchBar({ searchTerm, onSearchChange, filterType, onFilterChange }) {
  return (
    <div className="mb-8 sm:mb-12">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        {/* Search Input */}
        <input
          type="text"
          placeholder="search memes..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 px-4 py-2 sm:py-3 border border-gray-300 focus:outline-none focus:border-gray-900 transition font-serif italic text-sm sm:text-base"
        />

        {/* Filter by Type */}
        <select
          value={filterType}
          onChange={(e) => onFilterChange(e.target.value)}
          className="px-4 py-2 sm:py-3 border border-gray-300 focus:outline-none focus:border-gray-900 transition font-serif italic text-sm sm:text-base bg-white"
        >
          <option value="">all types</option>
          <option value="image">images</option>
          <option value="gif">gifs</option>
          <option value="video">videos</option>
        </select>
      </div>
    </div>
  )
}

export default SearchBar

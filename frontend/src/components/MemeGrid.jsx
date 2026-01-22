import MemeCard from './MemeCard'

function MemeGrid({ memes, onDelete }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {memes.map((meme) => (
        <MemeCard key={meme.id} meme={meme} onDelete={onDelete} />
      ))}
    </div>
  )
}

export default MemeGrid

import React from 'react'
import { Link } from 'react-router-dom'

const MovieCard = ({ movie }) => {
  // Ensure we have a valid tmdb_id
  const tmdbId = movie.tmdb_id || movie.tmdbId
  const posterPath = movie.poster_path || movie.posterPath
  const title = movie.title
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'

  const posterUrl = movie.poster_url || 
    (posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : 'https://via.placeholder.com/500x750?text=No+Poster')

  // Debug: log if tmdbId is missing
  if (!tmdbId) {
    console.warn('MovieCard missing tmdb_id:', movie)
    return <div className="text-red-500">Error: missing movie ID</div>
  }

  return (
    <Link to={`/app/movie/${tmdbId}`} className="block">
      <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:scale-105 transition-transform duration-200 cursor-pointer">
        <img src={posterUrl} alt={title} className="w-full h-64 object-cover" />
        <div className="p-3">
          <h3 className="font-semibold text-lg truncate">{title}</h3>
          <div className="flex justify-between text-sm text-gray-400 mt-1">
            <span>{year}</span>
            <span>⭐ {rating}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default MovieCard
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import MovieCard from "../components/MovieCard";
import { invalidateCache } from "../hooks/useCachedFetch"; // 👈 import

const MovieDetail = () => {
  const { tmdbId } = useParams();
  const [movie, setMovie] = useState(null);
  const [rating, setRating] = useState("");
  const [watched, setWatched] = useState(false);
  const [similar, setSimilar] = useState([]);
  const [message, setMessage] = useState("");
  const [inWatchlist, setInWatchlist] = useState(false);
  const { token } = useAuth();

  const getToken = () => token || localStorage.getItem("token");

  useEffect(() => {
    fetchMovie();
    checkWatchlist();
  }, [tmdbId]);

  const fetchMovie = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/movies/${tmdbId}`);
      setMovie(res.data);
      const similarRes = await axios.get(
        `http://localhost:5000/api/recommendations/similar/${res.data.id}?limit=6`
      );
      setSimilar(similarRes.data);
      
      const activeToken = getToken();
      if (activeToken) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${activeToken}`;
        const ratingsRes = await axios.get("http://localhost:5000/api/users/ratings");
        const existing = ratingsRes.data.find((r) => r.tmdb_id === parseInt(tmdbId));
        if (existing) {
          setRating(existing.rating || "");
          setWatched(existing.watched);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const checkWatchlist = async () => {
    const activeToken = getToken();
    if (!activeToken) return;
    try {
      axios.defaults.headers.common["Authorization"] = `Bearer ${activeToken}`;
      const res = await axios.get("http://localhost:5000/api/users/watchlist");
      setInWatchlist(res.data.some((m) => m.tmdb_id === parseInt(tmdbId)));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleWatchlist = async () => {
    const activeToken = getToken();
    if (!activeToken) {
      setMessage("Please login to manage watchlist");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    try {
      axios.defaults.headers.common["Authorization"] = `Bearer ${activeToken}`;
      if (inWatchlist) {
        await axios.delete(`http://localhost:5000/api/users/watchlist/${tmdbId}`);
        setInWatchlist(false);
        setMessage("Removed from watchlist");
      } else {
        await axios.post("http://localhost:5000/api/users/watchlist", {
          tmdb_id: parseInt(tmdbId),
        });
        setInWatchlist(true);
        setMessage("Added to watchlist");
      }
      // 👇 Invalidate watchlist cache so Watchlist page updates
      invalidateCache("watchlist");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      alert(err.response?.data?.error || "Error updating watchlist");
    }
  };

  const handleRate = async () => {
    const activeToken = getToken();
    if (!activeToken) {
      setMessage("Please login to rate");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    try {
      axios.defaults.headers.common["Authorization"] = `Bearer ${activeToken}`;
      await axios.post("http://localhost:5000/api/users/rate", {
        tmdb_id: parseInt(tmdbId),
        rating: rating ? parseInt(rating) : null,
        watched: watched,
      });
      setMessage("Rating saved!");
      // 👇 Invalidate ratings and recommendations caches
      invalidateCache("ratings");
      invalidateCache("recommendations");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Error saving rating");
    }
  };

  if (!movie) return <div className="text-center mt-10">Loading...</div>;

  const posterUrl = movie.poster_url || (movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "/placeholder.jpg");
  const backdropUrl = movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : "";

  return (
    <div>
      {/* Hero Section - same as before */}
      <div className="relative rounded-xl overflow-hidden mb-8 shadow-2xl">
        {backdropUrl && (
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${backdropUrl})` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent" />
        <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row gap-6 items-center md:items-end">
          <div className="w-48 md:w-64 rounded-xl overflow-hidden shadow-2xl transform -translate-y-4 md:-translate-y-8">
            <img src={posterUrl} alt={movie.title} className="w-full h-auto" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-bold mb-2">{movie.title}</h1>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start text-gray-300 mb-3">
              <span>{new Date(movie.release_date).getFullYear()}</span>
              <span>⭐ {movie.vote_average?.toFixed(1)} / 10</span>
              {movie.genres && JSON.parse(movie.genres).slice(0, 3).map(g => (
                <span key={g} className="text-sm bg-gray-700/50 px-2 py-0.5 rounded-full">{g}</span>
              ))}
            </div>
            <p className="text-gray-200 max-w-2xl mx-auto md:mx-0">{movie.overview}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 mb-10 shadow-xl border border-gray-700">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative">
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="appearance-none bg-gray-900 border border-gray-600 text-white rounded-full px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Rate ★</option>
                {[1,2,3,4,5,6,7,8,9,10].map(r => <option key={r}>{r}★</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">▼</div>
            </div>
            <button
              onClick={() => setWatched(!watched)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${
                watched ? "bg-green-600 hover:bg-green-700" : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              {watched ? "✓ Watched" : "👁️ Mark Watched"}
            </button>
            <button
              onClick={handleRate}
              className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-full font-semibold shadow-lg"
            >
              Save Rating
            </button>
          </div>
          <button
            onClick={toggleWatchlist}
            className={`flex items-center gap-2 px-5 py-2 rounded-full font-medium transition shadow-md ${
              inWatchlist ? "bg-blue-600 hover:bg-blue-700" : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {inWatchlist ? "✓ In Watchlist" : "+ Add to Watchlist"}
          </button>
        </div>
        {message && <div className="mt-3 text-sm text-green-400 text-center animate-pulse">{message}</div>}
      </div>

      {/* Similar Movies */}
      {similar.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-red-500 rounded-full"></span>
            More Like This
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {similar.map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetail;
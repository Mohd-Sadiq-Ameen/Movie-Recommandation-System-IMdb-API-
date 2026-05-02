import React, { useState } from "react";
import axios from "axios";
import MovieCard from "../components/MovieCard";
import FilterBar from "../components/FilterBar";
import { useCachedFetch } from "../hooks/useCachedFetch";

// 👇 Define API base URL once
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const Home = () => {
  // ----- Cached data with instant display -----
  const { data: trending, loading: trendingLoading } = useCachedFetch(
    "trending",
    () =>
      axios
        .get(`${API_BASE_URL}/movies/trending`)
        .then((res) => res.data.results.slice(0, 6))
  );

  const { data: latest, loading: latestLoading } = useCachedFetch(
    "latest",
    () =>
      axios
        .get(`${API_BASE_URL}/movies/discover`, {
          params: { sort_by: "release_date.desc", page: 1 },
        })
        .then((res) => res.data.results.slice(0, 6))
  );

  // ----- Search & filters (no caching needed) -----
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [filters, setFilters] = useState({
    year: null,
    min_rating: null,
    language: null,
  });
  const [showSearchResults, setShowSearchResults] = useState(false);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoadingSearch(true);
    setShowSearchResults(true);
    try {
      const params = { q: searchQuery, page: 1 };
      if (filters.year) params.year = filters.year;
      if (filters.min_rating) params.min_rating = filters.min_rating;
      if (filters.language) params.language = filters.language;
      const res = await axios.get(`${API_BASE_URL}/movies/search`, {
        params,
      });
      setSearchResults(res.data.results);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoadingSearch(false);
    }
  };

  const applyFilters = (newFilters) => {
    setFilters(newFilters);
    if (searchQuery.trim()) {
      setLoadingSearch(true);
      setShowSearchResults(true);
      const params = { q: searchQuery, page: 1 };
      if (newFilters.year) params.year = newFilters.year;
      if (newFilters.min_rating) params.min_rating = newFilters.min_rating;
      if (newFilters.language) params.language = newFilters.language;
      axios
        .get(`${API_BASE_URL}/movies/search`, { params })
        .then((res) => setSearchResults(res.data.results))
        .catch((err) => console.error(err))
        .finally(() => setLoadingSearch(false));
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
    setFilters({ year: null, min_rating: null, language: null });
  };

  // ----- Skeleton loader for movie grids -----
  const SkeletonGrid = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-gray-800 rounded-lg h-72 animate-pulse"></div>
      ))}
    </div>
  );

  return (
    <div>
      {/* Search + Filters */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search movies..."
            className="flex-1 px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg"
          >
            Search
          </button>
          {showSearchResults && (
            <button
              onClick={clearSearch}
              className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg"
            >
              Clear
            </button>
          )}
        </form>
        <FilterBar onFilter={applyFilters} />
      </div>

      {/* Search Results */}
      {showSearchResults && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">
            Search Results for "{searchQuery}"
          </h2>
          {loadingSearch ? (
            <p className="text-center">Loading...</p>
          ) : searchResults.length === 0 ? (
            <p className="text-center text-gray-400">
              No movies found. Try different filters.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {searchResults.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Latest Releases – with skeleton while loading for the first time */}
      {!showSearchResults && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Latest Releases</h2>
          {latestLoading && !latest ? (
            <SkeletonGrid />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {latest?.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Trending – with skeleton while loading for the first time */}
      {!showSearchResults && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Trending Today</h2>
          {trendingLoading && !trending ? (
            <SkeletonGrid />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {trending?.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
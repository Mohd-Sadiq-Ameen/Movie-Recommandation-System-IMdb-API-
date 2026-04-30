import React from "react";
import axios from "axios";
import MovieCard from "../components/MovieCard";
import { useCachedFetch } from "../hooks/useCachedFetch";

const Watchlist = () => {
  const { data: watchlist, loading } = useCachedFetch(
    "watchlist",
    () => axios.get("http://localhost:5000/api/users/watchlist").then(res => res.data)
  );

  if (loading && !watchlist) {
    return <div className="text-center mt-10">Loading watchlist...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Watchlist</h1>
      {watchlist?.length === 0 ? (
        <p className="text-gray-400">Your watchlist is empty. Add movies from their detail page.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {watchlist?.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Watchlist;
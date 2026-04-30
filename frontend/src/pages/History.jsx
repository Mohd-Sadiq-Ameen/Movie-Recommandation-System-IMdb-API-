import React, { useState } from "react";
import axios from "axios";
import MovieCard from "../components/MovieCard";
import { useCachedFetch } from "../hooks/useCachedFetch";

const History = () => {
  const { data: ratings, loading } = useCachedFetch(
    "ratings",
    () => axios.get("http://localhost:5000/api/users/ratings").then(res => res.data)
  );

  const [filter, setFilter] = useState("all"); // all, rated, watched

  const filteredMovies = ratings?.filter((item) => {
    if (filter === "rated") return item.rating && item.rating > 0;
    if (filter === "watched") return item.watched === 1;
    return true;
  }) || [];

  if (loading && !ratings) {
    return <div className="text-center mt-10">Loading history...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Your Movie History</h1>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-700">
        {["all", "rated", "watched"].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 capitalize ${
              filter === type
                ? "border-b-2 border-red-500 text-red-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {type === "all" ? "All" : type === "rated" ? "Rated" : "Watched"}
          </button>
        ))}
      </div>

      {filteredMovies.length === 0 ? (
        <p className="text-gray-400">No movies found. Rate or watch some movies first.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredMovies.map((item) => (
            <div key={item.id} className="relative">
              <MovieCard movie={item} />
              <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-xs px-2 py-1 rounded">
                {item.rating ? `⭐ ${item.rating}` : item.watched ? "Watched" : ""}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
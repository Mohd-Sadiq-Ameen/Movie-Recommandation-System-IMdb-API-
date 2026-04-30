import React from "react";
import axios from "axios";
import MovieCard from "../components/MovieCard";
import { useCachedFetch } from "../hooks/useCachedFetch";

const Recommended = () => {
  const { data: recommendations, loading } = useCachedFetch(
    "recommendations",
    () => axios.get("http://localhost:5000/api/recommendations/for-me").then(res => res.data)
  );

  if (loading && !recommendations) {
    return <div className="text-center mt-10">Loading recommendations...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Recommended For You</h1>
      {!recommendations?.length ? (
        <div className="text-center text-gray-400 mt-10">
          <p>Rate some movies (7+ stars) to get personalized recommendations!</p>
          <p className="mt-2 text-sm">Go to a movie page and give it a high rating.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {recommendations.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Recommended;
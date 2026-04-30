import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import MovieCard from "../components/MovieCard";

const Profile = () => {
  const { user } = useAuth();
  const [ratings, setRatings] = useState([]);
  const [activeTab, setActiveTab] = useState("rated"); // "rated" or "watched"

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users/ratings");
      setRatings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate stats
  const totalRatings = ratings.filter((r) => r.rating && r.rating > 0).length;
  const watchedMovies = ratings.filter((r) => r.watched === 1).length;
  const avgRating =
    totalRatings > 0
      ? (
          ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / totalRatings
        ).toFixed(1)
      : "N/A";

  const ratedMovies = ratings.filter((r) => r.rating && r.rating > 0);
  const watchedOnly = ratings.filter((r) => r.watched === 1 && (!r.rating || r.rating === 0));

  const displayMovies = activeTab === "rated" ? ratedMovies : watchedOnly;

  return (
    <div>
      {/* Profile Header with Stats Cards */}
      <div className="relative mb-8">
        <div className="bg-gradient-to-r from-purple-800 to-indigo-800 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">{user?.username}</h1>
              <p className="text-purple-200 mt-1">
                Member since {new Date(user?.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long" })}
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{totalRatings}</div>
                <div className="text-purple-200 text-sm">Ratings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{avgRating}</div>
                <div className="text-purple-200 text-sm">Avg. Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{watchedMovies}</div>
                <div className="text-purple-200 text-sm">Watched</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab("rated")}
          className={`px-4 py-2 font-medium transition ${
            activeTab === "rated"
              ? "border-b-2 border-red-500 text-red-500"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Rated Movies ({ratedMovies.length})
        </button>
        <button
          onClick={() => setActiveTab("watched")}
          className={`px-4 py-2 font-medium transition ${
            activeTab === "watched"
              ? "border-b-2 border-red-500 text-red-500"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Watched Only ({watchedOnly.length})
        </button>
      </div>

      {/* Movie Grid */}
      {displayMovies.length === 0 ? (
        <p className="text-gray-400 text-center py-10">
          {activeTab === "rated"
            ? "You haven't rated any movies yet. Rate some movies to see them here."
            : "You haven't marked any movies as watched without rating. Use the 'Mark Watched' button on movie pages."}
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {displayMovies.map((item) => (
            <div key={item.id} className="relative">
              <MovieCard movie={item} />
              {/* Overlay badge for rating */}
              {item.rating && (
                <div className="absolute top-2 right-2 bg-black/70 text-yellow-400 text-xs font-bold px-2 py-1 rounded-full">
                  {item.rating}★
                </div>
              )}
              {item.watched && !item.rating && (
                <div className="absolute top-2 right-2 bg-black/70 text-green-400 text-xs font-bold px-2 py-1 rounded-full">
                  Watched
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;
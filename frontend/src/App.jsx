import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Recommended from "./pages/Recommended";
import Watchlist from "./pages/Watchlist";
import History from "./pages/History";
import Profile from "./pages/Profile";
import MovieDetail from "./pages/MovieDetail";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes – the actual app */}
        <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route path="/app" element={<Home />} />
          <Route path="/app/recommended" element={<Recommended />} />
          <Route path="/app/watchlist" element={<Watchlist />} />
          <Route path="/app/history" element={<History />} />
          <Route path="/app/profile" element={<Profile />} />
          <Route path="/app/movie/:tmdbId" element={<MovieDetail />} />
        </Route>

        {/* Catch-all: redirect to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
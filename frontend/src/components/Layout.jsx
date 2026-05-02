import React from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

const navItems = [
  { path: "/app", label: "Home" },
  { path: "/app/recommended", label: "For You" },
  { path: "/app/watchlist", label: "Watchlist" },
  { path: "/app/history", label: "History" },
  { path: "/app/profile", label: "Profile" },
];

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 text-xl font-bold text-red-500 border-b border-gray-700">
          MovieRec
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? "bg-red-600 text-white"
                      : "hover:bg-gray-700"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Logout
          </button>
          <div className="mt-4 text-xs text-gray-500 text-center">
            Logged in as {user?.username}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
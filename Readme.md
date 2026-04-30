# 🎬 MovieRec – Personalized Movie Recommendation App

MovieRec is a full‑stack web application that helps users discover movies, rate what they’ve watched, build a watchlist, and receive intelligent content‑based recommendations. It combines a modern React frontend with a Flask REST API, using The Movie Database (TMDB) as the primary data source.

---

## ✨ Features

- **User Authentication** – Register / login with JWT‑based sessions.
- **Movie Search** – Search by title with powerful filters: year, minimum rating, language.
- **Trending & Latest** – See today’s trending movies and the newest releases.
- **Personalized Recommendations** – Content‑based engine that suggests movies similar to those you rated 7★ or higher.
- **Watchlist** – Save movies to watch later (independent of rating).
- **Rating & Watch History** – Rate movies (1‑10★) and mark them as watched.
- **Profile Dashboard** – View your stats (total ratings, average rating, watched count) and browse your rated/watched movies in a grid.
- **Movie Detail Page** – Detailed view with backdrop, poster, genres, overview, and a “More Like This” section.
- **Responsive UI** – Sidebar navigation, dark theme, and fluid grids.

---

## 🛠️ Technologies Used

### Frontend
- **React 18** – Component‑based UI
- **React Router DOM** – Client‑side routing
- **Axios** – HTTP client for API calls
- **Tailwind CSS** – Utility‑first styling
- **Vite** – Fast build tool and dev server

### Backend
- **Flask** – Lightweight Python web framework
- **Flask‑JWT‑Extended** – JWT authentication
- **Flask‑CORS** – Cross‑origin resource sharing
- **SQLite3** – Embedded database (lightweight, no separate server)
- **TMDB API** – The Movie Database for movie metadata, posters, and trending data

### Development & Deployment
- **Python‑dotenv** – Environment variable management
- **Concurrent development** – Backend on port 5000, frontend on port 5173

---

## 🚀 How It Works

1. **User registers / logs in** – The backend issues a JWT token stored in `localStorage`.
2. **Home page** – Shows trending movies and latest releases. Caching ensures fast tab switching.
3. **Search & filters** – User enters a query; backend calls TMDB search endpoint with optional filters.
4. **Rate a movie** – On the movie detail page, user selects a star rating and optionally marks as watched. This data is stored in SQLite.
5. **Recommendations** – The recommender analyzes all user ratings (≥7★), collects genre preferences, and finds other movies with matching genres. An explanation (“Because you liked X”) is shown.
6. **Watchlist** – Separate from ratings, users can add/remove movies to a personal watchlist.
7. **Profile & History** – Displays statistics and all rated/watched movies with visual badges.

---

## 📦 Database Schema (SQLite)

```sql
users(id, username, password_hash, created_at)
movies(id, tmdb_id, title, overview, release_date, poster_path, backdrop_path, vote_average, genres, language, popularity)
user_ratings(user_id, movie_id, rating, watched, created_at)
user_watchlist(user_id, movie_id, added_at)




---------------------------------------------------------------------------

🧪 Setup Instructions
--------------------------------
Prerequisites
Python 3.9+

Node.js 18+

TMDB API key (free) – get it from themoviedb.org
--------------------------------------------------------------

Backend Setup

--------------------------------------------------------------

bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt

--------------------------------------------------------------

Create a .env file in the backend folder:

--------------------------------------------------------------

TMDB_API_KEY=your_tmdb_api_key_here
SECRET_KEY=your_random_secret_key
JWT_SECRET_KEY=your_another_random_key

--------------------------------------------------------------

Run the Flask server: python app.py

--------------------------------------------------------------

Frontend Setup

--------------------------------------------------------------

cd frontend
npm install
npm run dev
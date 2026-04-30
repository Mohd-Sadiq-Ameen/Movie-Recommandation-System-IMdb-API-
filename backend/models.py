import sqlite3
from config import Config

def get_db_connection():
    conn = sqlite3.connect(Config.DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Movies table (cached from TMDB)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS movies (
            id INTEGER PRIMARY KEY,
            tmdb_id INTEGER UNIQUE NOT NULL,
            title TEXT NOT NULL,
            overview TEXT,
            release_date TEXT,
            poster_path TEXT,
            backdrop_path TEXT,
            vote_average REAL,
            vote_count INTEGER,
            genres TEXT,
            language TEXT,
            popularity REAL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # User ratings & watch history
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_ratings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            movie_id INTEGER NOT NULL,
            rating INTEGER CHECK(rating >= 0 AND rating <= 10),
            watched BOOLEAN DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
            UNIQUE(user_id, movie_id)
        )
    ''')
    
    # Watchlist table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_watchlist (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            movie_id INTEGER NOT NULL,
            added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
            UNIQUE(user_id, movie_id)
        )
    ''')
    
    conn.commit()
    conn.close()

# Helper functions
def get_or_create_movie(tmdb_id, movie_data=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM movies WHERE tmdb_id = ?', (tmdb_id,))
    movie = cursor.fetchone()
    
    if movie:
        conn.close()
        return dict(movie)
    
    if not movie_data:
        conn.close()
        return None
    
    cursor.execute('''
        INSERT INTO movies (tmdb_id, title, overview, release_date, poster_path,
                           backdrop_path, vote_average, vote_count, genres, language, popularity)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        tmdb_id,
        movie_data.get('title'),
        movie_data.get('overview'),
        movie_data.get('release_date'),
        movie_data.get('poster_path'),
        movie_data.get('backdrop_path'),
        movie_data.get('vote_average'),
        movie_data.get('vote_count'),
        movie_data.get('genres'),
        movie_data.get('original_language'),
        movie_data.get('popularity')
    ))
    conn.commit()
    
    cursor.execute('SELECT * FROM movies WHERE tmdb_id = ?', (tmdb_id,))
    movie = cursor.fetchone()
    conn.close()
    return dict(movie)
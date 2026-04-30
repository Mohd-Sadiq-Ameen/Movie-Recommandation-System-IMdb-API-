import json
from models import get_db_connection

class Recommender:
    @staticmethod
    def get_recommendations_for_user(user_id, limit=10):
        """
        Content-based recommendations using genre similarity.
        Returns list of movies with explanation.
        """
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get user's highly rated movies (rating >= 7)
        cursor.execute('''
            SELECT m.id, m.tmdb_id, m.title, m.genres, ur.rating
            FROM user_ratings ur
            JOIN movies m ON ur.movie_id = m.id
            WHERE ur.user_id = ? AND ur.rating >= 7
            ORDER BY ur.rating DESC
        ''', (user_id,))
        liked_movies = cursor.fetchall()
        
        if not liked_movies:
            conn.close()
            return []
        
        # Build user's genre preference vector
        genre_scores = {}
        for liked in liked_movies:
            genres = json.loads(liked['genres'])
            for genre in genres:
                genre_scores[genre] = genre_scores.get(genre, 0) + liked['rating']
        
        # Get candidate movies (exclude those user already rated)
        placeholders = ','.join('?' for _ in liked_movies)
        cursor.execute(f'''
            SELECT id, tmdb_id, title, genres, poster_path, vote_average, release_date
            FROM movies
            WHERE id NOT IN (
                SELECT movie_id FROM user_ratings WHERE user_id = ?
            )
            ORDER BY popularity DESC
            LIMIT 100
        ''', (user_id,))
        candidates = cursor.fetchall()
        
        # Score each candidate based on genre overlap with user preferences
        scored = []
        for cand in candidates:
            cand_genres = json.loads(cand['genres'])
            score = sum(genre_scores.get(g, 0) for g in cand_genres)
            if score > 0:
                # Pick best liked movie to explain recommendation
                explanation_movie = liked_movies[0]['title']
                scored.append({
                    'id': cand['id'],
                    'tmdb_id': cand['tmdb_id'],
                    'title': cand['title'],
                    'poster_path': cand['poster_path'],
                    'vote_average': cand['vote_average'],
                    'release_date': cand['release_date'],
                    'score': score,
                    'explanation': f"Because you liked {explanation_movie}"
                })
        
        scored.sort(key=lambda x: x['score'], reverse=True)
        conn.close()
        return scored[:limit]
    
    @staticmethod
    def get_similar_movies(movie_id, limit=6):
        """Get movies similar to a given movie (by genre overlap)."""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT genres FROM movies WHERE id = ?', (movie_id,))
        movie = cursor.fetchone()
        if not movie:
            conn.close()
            return []
        
        source_genres = set(json.loads(movie['genres']))
        
        cursor.execute('''
            SELECT id, tmdb_id, title, genres, poster_path, vote_average, release_date
            FROM movies
            WHERE id != ?
            ORDER BY popularity DESC
            LIMIT 50
        ''', (movie_id,))
        candidates = cursor.fetchall()
        
        similar = []
        for cand in candidates:
            cand_genres = set(json.loads(cand['genres']))
            overlap = len(source_genres & cand_genres)
            if overlap > 0:
                similar.append({
                    'id': cand['id'],
                    'tmdb_id': cand['tmdb_id'],
                    'title': cand['title'],
                    'poster_path': cand['poster_path'],
                    'vote_average': cand['vote_average'],
                    'release_date': cand['release_date'],
                    'score': overlap
                })
        
        similar.sort(key=lambda x: x['score'], reverse=True)
        conn.close()
        return similar[:limit]
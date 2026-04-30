from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.tmdb_service import TMDBService
from models import get_or_create_movie, get_db_connection

movies_bp = Blueprint('movies', __name__)

@movies_bp.route('/search', methods=['GET'])
def search_movies():
    """Search movies with filters: q, page, year, language, min_rating."""
    query = request.args.get('q', '')
    page = int(request.args.get('page', 1))
    year = request.args.get('year')
    language = request.args.get('language')
    min_rating = request.args.get('min_rating', type=float)
    
    if not query:
        return jsonify({'error': 'Query parameter "q" is required'}), 400
    
    try:
        results = TMDBService.search_movies(query, page, year, language, min_rating)
        # Cache each movie in local DB
        cached_results = []
        for movie_data in results['results']:
            cached_movie = get_or_create_movie(movie_data['tmdb_id'], movie_data)
            # Add poster URL
            cached_movie['poster_url'] = TMDBService.get_poster_url(cached_movie['poster_path'])
            cached_results.append(cached_movie)
        
        return jsonify({
            'page': results['page'],
            'total_pages': results['total_pages'],
            'total_results': results['total_results'],
            'results': cached_results
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@movies_bp.route('/discover', methods=['GET'])
def discover_movies():
    """Discover movies with filters: page, year, language, min_rating, sort_by."""
    page = int(request.args.get('page', 1))
    year = request.args.get('year')
    language = request.args.get('language')
    min_rating = request.args.get('min_rating', type=float)
    sort_by = request.args.get('sort_by', 'popularity.desc')
    
    try:
        results = TMDBService.discover_movies(page, year, language, min_rating, sort_by)
        cached_results = []
        for movie_data in results['results']:
            cached_movie = get_or_create_movie(movie_data['tmdb_id'], movie_data)
            cached_movie['poster_url'] = TMDBService.get_poster_url(cached_movie['poster_path'])
            cached_results.append(cached_movie)
        
        return jsonify({
            'page': results['page'],
            'total_pages': results['total_pages'],
            'total_results': results['total_results'],
            'results': cached_results
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@movies_bp.route('/trending', methods=['GET'])
def trending_movies():
    """Get trending movies."""
    time_window = request.args.get('time_window', 'day')
    page = int(request.args.get('page', 1))
    
    try:
        results = TMDBService.get_trending_movies(time_window, page)
        cached_results = []
        for movie_data in results['results']:
            cached_movie = get_or_create_movie(movie_data['tmdb_id'], movie_data)
            cached_movie['poster_url'] = TMDBService.get_poster_url(cached_movie['poster_path'])
            cached_results.append(cached_movie)
        
        return jsonify({
            'page': results['page'],
            'total_pages': results['total_pages'],
            'total_results': results['total_results'],
            'results': cached_results
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@movies_bp.route('/<int:tmdb_id>', methods=['GET'])
def get_movie(tmdb_id):
    """Get single movie details (from cache or TMDB)."""
    from models import get_db_connection
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM movies WHERE tmdb_id = ?', (tmdb_id,))
    movie = cursor.fetchone()
    conn.close()
    
    if movie:
        movie = dict(movie)
        movie['poster_url'] = TMDBService.get_poster_url(movie['poster_path'])
        return jsonify(movie)
    
    # Not in cache, fetch from TMDB
    try:
        movie_data = TMDBService.get_movie_by_id(tmdb_id)
        cached_movie = get_or_create_movie(tmdb_id, movie_data)
        cached_movie['poster_url'] = TMDBService.get_poster_url(cached_movie['poster_path'])
        return jsonify(cached_movie)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import get_db_connection, get_or_create_movie
from services.tmdb_service import TMDBService
import sqlite3
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import get_db_connection, get_or_create_movie
from services.tmdb_service import TMDBService

users_bp = Blueprint('users', __name__)

@users_bp.route('/watchlist', methods=['GET'])
@jwt_required()
def get_watchlist():
    user_id = int(get_jwt_identity())
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT m.id, m.tmdb_id, m.title, m.poster_path, m.release_date, m.vote_average, wl.added_at
        FROM user_watchlist wl
        JOIN movies m ON wl.movie_id = m.id
        WHERE wl.user_id = ?
        ORDER BY wl.added_at DESC
    ''', (user_id,))
    watchlist = cursor.fetchall()
    conn.close()
    
    result = []
    for item in watchlist:
        movie = dict(item)
        movie['poster_url'] = TMDBService.get_poster_url(movie['poster_path'])
        result.append(movie)
    return jsonify(result)

@users_bp.route('/watchlist', methods=['POST'])
@jwt_required()
def add_to_watchlist():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    tmdb_id = data.get('tmdb_id')
    
    if not tmdb_id:
        return jsonify({'error': 'tmdb_id required'}), 400
    
    # Fetch movie from TMDB if not cached
    try:
        movie_data = TMDBService.get_movie_by_id(tmdb_id)
        movie = get_or_create_movie(tmdb_id, movie_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('INSERT INTO user_watchlist (user_id, movie_id) VALUES (?, ?)',
                       (user_id, movie['id']))
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({'error': 'Movie already in watchlist'}), 409
    conn.close()
    return jsonify({'message': 'Added to watchlist'}), 201

@users_bp.route('/watchlist/<int:tmdb_id>', methods=['DELETE'])
@jwt_required()
def remove_from_watchlist(tmdb_id):
    user_id = int(get_jwt_identity())
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        DELETE FROM user_watchlist
        WHERE user_id = ? AND movie_id = (SELECT id FROM movies WHERE tmdb_id = ?)
    ''', (user_id, tmdb_id))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Removed from watchlist'}), 200

@users_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = int(get_jwt_identity())
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT id, username, created_at FROM users WHERE id = ?', (user_id,))
    user = cursor.fetchone()
    conn.close()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify(dict(user))

@users_bp.route('/ratings', methods=['GET'])
@jwt_required()
def get_user_ratings():
    user_id = int(get_jwt_identity())
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT ur.rating, ur.watched, ur.created_at, m.id, m.tmdb_id, m.title, m.poster_path, m.release_date
        FROM user_ratings ur
        JOIN movies m ON ur.movie_id = m.id
        WHERE ur.user_id = ?
        ORDER BY ur.created_at DESC
    ''', (user_id,))
    ratings = cursor.fetchall()
    conn.close()
    
    result = []
    for r in ratings:
        movie = dict(r)
        movie['poster_url'] = TMDBService.get_poster_url(movie['poster_path'])
        result.append(movie)
    return jsonify(result)

@users_bp.route('/rate', methods=['POST'])
@jwt_required()
def rate_movie():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    tmdb_id = data.get('tmdb_id')
    rating = data.get('rating')  # 0-10, or None if just watched without rating
    watched = data.get('watched', False)
    
    if not tmdb_id:
        return jsonify({'error': 'tmdb_id required'}), 400
    
    # Ensure movie exists in local DB
    movie_data = None
    try:
        movie_data = TMDBService.get_movie_by_id(tmdb_id)
    except Exception as e:
        return jsonify({'error': f'Failed to fetch movie: {str(e)}'}), 500
    
    movie = get_or_create_movie(tmdb_id, movie_data)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if rating already exists
    cursor.execute('SELECT id FROM user_ratings WHERE user_id = ? AND movie_id = ?',
                   (user_id, movie['id']))
    existing = cursor.fetchone()
    
    if existing:
        # Update
        cursor.execute('''
            UPDATE user_ratings
            SET rating = ?, watched = ?, created_at = CURRENT_TIMESTAMP
            WHERE user_id = ? AND movie_id = ?
        ''', (rating, watched, user_id, movie['id']))
    else:
        # Insert
        cursor.execute('''
            INSERT INTO user_ratings (user_id, movie_id, rating, watched)
            VALUES (?, ?, ?, ?)
        ''', (user_id, movie['id'], rating, watched))
    
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Rating saved successfully'}), 200
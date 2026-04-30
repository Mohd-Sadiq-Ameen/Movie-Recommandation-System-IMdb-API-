from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.recommender import Recommender
from services.tmdb_service import TMDBService

recommendations_bp = Blueprint('recommendations', __name__)

@recommendations_bp.route('/for-me', methods=['GET'])
@jwt_required()
def get_recommendations():
    user_id = int(get_jwt_identity())
    limit = int(request.args.get('limit', 10))
    
    recs = Recommender.get_recommendations_for_user(user_id, limit)
    # Add poster URLs
    for rec in recs:
        rec['poster_url'] = TMDBService.get_poster_url(rec['poster_path'])
    return jsonify(recs)

@recommendations_bp.route('/similar/<int:movie_id>', methods=['GET'])
def similar_movies(movie_id):
    """Get movies similar to a given movie ID (local DB id)."""
    limit = int(request.args.get('limit', 6))
    similar = Recommender.get_similar_movies(movie_id, limit)
    for sim in similar:
        sim['poster_url'] = TMDBService.get_poster_url(sim['poster_path'])
    return jsonify(similar)

# Need to import request
from flask import request
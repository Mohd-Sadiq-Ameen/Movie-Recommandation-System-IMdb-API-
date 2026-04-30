import requests
import json
from config import Config

class TMDBService:
    @staticmethod
    def _request(endpoint, params=None):
        """Make request to TMDB API."""
        url = f"{Config.TMDB_BASE_URL}{endpoint}"
        default_params = {
            'api_key': Config.TMDB_API_KEY,
            'language': 'en-US'
        }
        if params:
            default_params.update(params)
        
        response = requests.get(url, params=default_params)
        response.raise_for_status()
        return response.json()
    
    @staticmethod
    def _parse_movie_data(movie):
        """Extract and format movie data for local storage."""
        return {
            'tmdb_id': movie['id'],
            'title': movie.get('title'),
            'overview': movie.get('overview'),
            'release_date': movie.get('release_date'),
            'poster_path': movie.get('poster_path'),
            'backdrop_path': movie.get('backdrop_path'),
            'vote_average': movie.get('vote_average'),
            'vote_count': movie.get('vote_count'),
            'genres': json.dumps([g['name'] for g in movie.get('genres', [])]),
            'original_language': movie.get('original_language'),
            'popularity': movie.get('popularity')
        }
    
    @staticmethod
    def get_movie_by_id(tmdb_id):
        """Fetch single movie details from TMDB."""
        data = TMDBService._request(f'/movie/{tmdb_id}')
        return TMDBService._parse_movie_data(data)
    
    @staticmethod
    def search_movies(query, page=1, year=None, language=None, min_rating=None):
        """
        Search movies with optional filters.
        Filters: year, language (ISO 639-1), min_rating (0-10).
        """
        params = {
            'query': query,
            'page': page,
            'include_adult': False
        }
        if year:
            params['primary_release_year'] = year
        if language:
            params['with_original_language'] = language
        if min_rating:
            params['vote_average.gte'] = min_rating
        
        data = TMDBService._request('/search/movie', params)
        results = []
        for movie in data.get('results', []):
            # Fetch full details to get genres (search results have limited info)
            full_movie = TMDBService.get_movie_by_id(movie['id'])
            results.append(full_movie)
        return {
            'page': data.get('page'),
            'total_pages': data.get('total_pages'),
            'total_results': data.get('total_results'),
            'results': results
        }
    
    @staticmethod
    def discover_movies(page=1, year=None, language=None, min_rating=None, sort_by='popularity.desc'):
        """Discover movies with advanced filters."""
        params = {
            'page': page,
            'sort_by': sort_by,
            'include_adult': False
        }
        if year:
            params['primary_release_year'] = year
        if language:
            params['with_original_language'] = language
        if min_rating:
            params['vote_average.gte'] = min_rating
        
        data = TMDBService._request('/discover/movie', params)
        results = []
        for movie in data.get('results', []):
            full_movie = TMDBService.get_movie_by_id(movie['id'])
            results.append(full_movie)
        return {
            'page': data.get('page'),
            'total_pages': data.get('total_pages'),
            'total_results': data.get('total_results'),
            'results': results
        }
    
    @staticmethod
    def get_trending_movies(time_window='day', page=1):
        """Get trending movies (day or week)."""
        data = TMDBService._request(f'/trending/movie/{time_window}', {'page': page})
        results = []
        for movie in data.get('results', []):
            full_movie = TMDBService.get_movie_by_id(movie['id'])
            results.append(full_movie)
        return {
            'page': data.get('page'),
            'total_pages': data.get('total_pages'),
            'total_results': data.get('total_results'),
            'results': results
        }
    
    @staticmethod
    def get_poster_url(path, size='w500'):
        """Build poster URL."""
        if not path:
            return None
        return f"{Config.TMDB_IMAGE_BASE_URL}{size}{path}"
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from config import Config
from models import init_db
from routes.auth import auth_bp
from routes.movies import movies_bp
from routes.users import users_bp
from routes.recommendations import recommendations_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    CORS(app, supports_credentials=True)
    jwt = JWTManager(app)
    
    # Initialize database
    init_db()
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(movies_bp, url_prefix='/api/movies')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(recommendations_bp, url_prefix='/api/recommendations')
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
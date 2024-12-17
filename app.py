from flask import Flask
from app.routes import bible_routes, song_routes

def create_app():
    app = Flask(__name__)
    app.register_blueprint(bible_routes, url_prefix='/bible')
    app.register_blueprint(song_routes, url_prefix='/song')
    return app

if __name__ == "__main__":
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)

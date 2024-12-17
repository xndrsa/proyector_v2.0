from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": "*"}})

    # Importar rutas
    from app.routes import bible_routes, song_routes

    # Registrar las rutas en el app
    app.register_blueprint(bible_routes)
    app.register_blueprint(song_routes)

    return app

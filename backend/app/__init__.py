from flask import Flask
from flask_cors import CORS
from flask_restx import Api
from .routes import bible_ns, song_ns
from .config import DevelopmentConfig

def create_app(config_class=DevelopmentConfig):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Configurar CORS
    CORS(app, resources={r"/*": {"origins": "*"}})

    # Configurar Flask-RESTX
    api = Api(
        app,
        version='1.0',
        title='API Biblia y Canciones',
        description='Una API para leer versículos bíblicos y obtener letras de canciones.',
        doc='/docs'  # URL para la interfaz de Swagger UI
    )

    # Registrar Namespaces
    api.add_namespace(bible_ns, path='/bible')
    api.add_namespace(song_ns, path='/song')

    return app
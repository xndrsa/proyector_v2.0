from flask import Flask
from flask_cors import CORS
from flasgger import Swagger
from app.config import SWAGGER_TEMPLATE, APP_NAME, APP_VERSION

def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": "*"}})

    swagger = Swagger(app, template=SWAGGER_TEMPLATE)

    from app.routes import bible_routes, song_routes
    app.register_blueprint(bible_routes)
    app.register_blueprint(song_routes)

    return app

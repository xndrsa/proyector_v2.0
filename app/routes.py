from flask import Blueprint, jsonify, request
from app.utils import (
    fetch_bible_versions, fetch_verses, load_song
)

bible_routes = Blueprint('bible', __name__)
song_routes = Blueprint('song', __name__)


@bible_routes.route('/versions', methods=['GET'])
def get_versions():
    versions = fetch_bible_versions()
    if versions:
        return jsonify(versions)
    return jsonify({"error": "No se pudieron obtener las versiones"}), 500


@bible_routes.route('/read/<version>/<book>/<chapter>/<verse>', defaults={'range': None}, methods=['GET'])
@bible_routes.route('/read/<version>/<book>/<chapter>/<verse>-<range>', methods=['GET'])
def get_bible_verse(version, book, chapter, verse, range):
    # Consultar la API externa para obtener los versículos
    try:
        bible_data = fetch_verses(version, book, chapter, verse, range)
        if not bible_data:
            return jsonify({"error": "Versículo no encontrado."}), 404
        
        # Responder con los datos obtenidos
        return jsonify({
            "version": version,
            "book": book,
            "chapter": chapter,
            "verse": verse,
            "range": range,
            "text": bible_data
        })
    except ValueError:
        return jsonify({"error": "El formato del capítulo, verso o rango es incorrecto."}), 400















@song_routes.route('/<category>/<song_name>', methods=['GET'])
def get_song_lyrics(category, song_name):
    """
    Obtiene la letra de una canción específica.

    ---
    parameters:
      - name: category
        in: path
        type: string
        required: true
        description: Categoría de la canción
      - name: song_name
        in: path
        type: string
        required: true
        description: Nombre del archivo de la canción
    responses:
      200:
        description: Canción encontrada
        schema:
          type: object
          properties:
            song_name:
              type: string
            category:
              type: string
            lyrics:
              type: array
              items:
                type: string
      404:
        description: Canción no encontrada
      400:
        description: Categoría inválida
    """
    if category not in ['lentas', 'rapidas']:
        return jsonify({"error": "Categoría no válida. Use 'lentas' o 'rapidas'."}), 400

    song_data = load_song(category, song_name)
    if not song_data:
        return jsonify({"error": "Canción no encontrada."}), 404

    return jsonify({"song_name": song_name, "category": category, "lyrics": song_data})
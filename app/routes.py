from flask import Blueprint, jsonify, request
from app.utils import load_bible_version, get_verse, load_song
import os

bible_routes = Blueprint('bible', __name__)
song_routes = Blueprint('song', __name__)

# Diccionario para traducir el nombre del libro al número
book_name_to_number = {
    'genesis': 1, 'exodo': 2, 'levitico': 3, 'numeros': 4, 'deuteronomio': 5,
    'josue': 6, 'jueces': 7, 'rut': 8, '1_samuel': 9, '2_samuel': 10, '1_reyes': 11,
    '2_reyes': 12, '1_cronicas': 13, '2_cronicas': 14, 'esdras': 15, 'nehemias': 16,
    'ester': 17, 'job': 18, 'salmos': 19, 'proverbios': 20, 'eclesiastes': 21, 'cantares': 22,
    'isaias': 23, 'jeremias': 24, 'lamentaciones': 25, 'ezequiel': 26, 'daniel': 27,
    'oseas': 28, 'joel': 29, 'amos': 30, 'abdias': 31, 'jonas': 32, 'miqueas': 33,
    'nahum': 34, 'habacuc': 35, 'sofonias': 36, 'ageo': 37, 'zacarias': 38, 'malaquias': 39,
    'mateo': 40, 'marcos': 41, 'lucas': 42, 'juan': 43, 'hechos': 44, 'romanos': 45,
    '1_corintios': 46, '2_corintios': 47, 'gálatas': 48, 'efesios': 49, 'filipenses': 50,
    'colosenses': 51, '1_tesalonicenses': 52, '2_tesalonicenses': 53, '1_timoteo': 54,
    '2_timoteo': 55, 'tito': 56, 'filemon': 57, 'hebreos': 58, 'santiago': 59, '1_pedro': 60,
    '2_pedro': 61, '1_juan': 62, '2_juan': 63, '3_juan': 64, 'judas': 65, 'apocalipsis': 66
}

@bible_routes.route('/bible/<version>/<book>/<chapter>/<verse>', methods=['GET'])
def get_bible_verse(version, book, chapter, verse):
    book_number = book_name_to_number.get(book.lower())
    if not book_number:
        return jsonify({"error": "Libro no válido."}), 404

    bible_data = load_bible_version(version, book)
    if not bible_data:
        return jsonify({"error": "Versión o libro no encontrados."}), 404

    try:
        chapter = int(chapter)
        verse = int(verse)
        verse_text = get_verse(bible_data, book_number, chapter, verse)
        return jsonify({"version": version, "book": book, "chapter": chapter, "verse": verse, "text": verse_text})
    except ValueError:
        return jsonify({"error": "El formato del capítulo o verso es incorrecto."}), 400


@song_routes.route('/song/<category>/<song_name>', methods=['GET'])
def get_song_lyrics(category, song_name):
    if category not in ['lentas', 'rapidas']:
        return jsonify({"error": "Categoría no válida. Use 'lentas' o 'rapidas'."}), 400

    song_data = load_song(category, song_name)
    if not song_data:
        return jsonify({"error": "Canción no encontrada."}), 404

    return jsonify({"song_name": song_name, "category": category, "lyrics": song_data})

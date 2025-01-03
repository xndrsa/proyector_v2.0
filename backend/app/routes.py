from flask_restx import Namespace, Resource, fields, reqparse
from app.utils import fetch_bible_versions, fetch_verses, LyricsService

# Namespaces
bible_ns = Namespace('bible', description='Operaciones para la Biblia')
song_ns = Namespace('song', description='Operaciones para las canciones')

single_verse_model = bible_ns.model('SingleVerse', {
    'id': fields.Integer(description='ID del versículo'),
    'number': fields.Integer(description='Número del versículo'),
    'verse': fields.String(description='Texto del versículo'),
    'study': fields.String(description='Comentario o título'),
})

# Modelo de datos versión de la Biblia
bible_version_model = bible_ns.model('BibleVersion', {
    'id': fields.String(required=True, description='Identificador de la versión'),
    'name': fields.String(required=True, description='Nombre de la versión'),
})

# Modelo de datos versículo de la Biblia
bible_verse_model = bible_ns.model('BibleVerse', {
    'version': fields.String(required=True, description='Versión de la Biblia'),
    'book': fields.String(required=True, description='Libro de la Biblia'),
    'chapter': fields.Integer(required=True, description='Capítulo'),
    'verse': fields.Integer(required=True, description='Verso'),
    'range': fields.String(required=False, description='Rango de versículos'),
    'text': fields.List(fields.Nested(single_verse_model)),  # <-- en lugar de fields.String
})

# Modelo para canción
song_model = song_ns.model('Song', {
    'song_name': fields.String(required=True, description='Nombre de la canción'),
    'category': fields.String(required=True, description='Categoría de la canción'),
    'lyrics': fields.String(description='Letras de la canción'),
})

@bible_ns.route('/versions')
class BibleVersions(Resource):
    def get(self):
        """Obtiene las versiones disponibles de la Biblia con sus endpoints"""
        result = fetch_bible_versions()
        if result:
            return result
        bible_ns.abort(500, "No se pudieron obtener las versiones")

@bible_ns.route('/read/<string:version>/<string:book>/<int:chapter>/<int:verse>')
@bible_ns.route('/read/<string:version>/<string:book>/<int:chapter>/<int:verse>-<string:range>')
class BibleVerse(Resource):
    @bible_ns.marshal_with(bible_verse_model)
    def get(self, version, book, chapter, verse, range=None):
        """Obtiene un versículo específico de la Biblia"""
        try:
            bible_data = fetch_verses(version, book, chapter, verse, range)
            if not bible_data:
                bible_ns.abort(404, "Versículo no encontrado.")
            
            return {
                "version": version,
                "book": book,
                "chapter": chapter,
                "verse": verse,
                "range": range,
                "text": bible_data
            }
        except ValueError:
            bible_ns.abort(400, "El formato del capítulo, verso o rango es incorrecto.")

@song_ns.route('/<string:category>/<string:artist>/<string:song_name>')
class SongLyrics(Resource):
    @song_ns.doc(params={
        'category': 'Categoría de la canción (lentas o rápidas)',
        'artist': 'Nombre del artista',
        'song_name': 'Nombre de la canción'
    })
    def get(self, category, artist, song_name):
        """
        Obtiene la letra de una canción específica.
        """
        service = LyricsService()
        query = f"{song_name} {artist}"
        query_results = service.search_lyrics(query=query)

        if not query_results:
            song_ns.abort(404, "Canción no encontrada.")

        # Obtén el primer resultado
        track_id = query_results[0]["id"]
        track_details = service.get_lyrics_by_id(track_id)

        return {
            "song_name": track_details.get("trackName"),
            "category": category,
            "artist": track_details.get("artistName"),
            "lyrics": track_details.get("plainLyrics"),
        }

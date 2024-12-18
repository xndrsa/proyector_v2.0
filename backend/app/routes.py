from flask_restx import Namespace, Resource, fields, reqparse
from app.utils import fetch_bible_versions, fetch_verses, load_song

# Namespaces
bible_ns = Namespace('bible', description='Operaciones para la Biblia')
song_ns = Namespace('song', description='Operaciones para las canciones')

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
    'text': fields.String(required=True, description='Texto del versículo'),
})

song_model = song_ns.model('Song', {
    'song_name': fields.String(required=True, description='Nombre de la canción'),
    'category': fields.String(required=True, description='Categoría de la canción'),
    'lyrics': fields.List(fields.String, description='Letras de la canción'),
})

# Definir rutas usando Resource
@bible_ns.route('/versions')
class BibleVersions(Resource):
    @bible_ns.marshal_list_with(bible_version_model)
    def get(self):
        """Obtiene las versiones disponibles de la Biblia"""
        versions = fetch_bible_versions()
        if versions:
            return versions
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

@song_ns.route('/<string:category>/<string:song_name>')
class SongLyrics(Resource):
    @song_ns.doc(params={
        'category': 'Categoría de la canción (lentas o rapidas)',
        'song_name': 'Nombre del archivo de la canción'
    })
    @song_ns.marshal_with(song_model)
    def get(self, category, song_name):
        """
        Obtiene la letra de una canción específica.
        """
        if category not in ['lentas', 'rapidas']:
            song_ns.abort(400, "Categoría no válida. Use 'lentas' o 'rapidas'.")

        song_data = load_song(category, song_name)
        if not song_data:
            song_ns.abort(404, "Canción no encontrada.")

        return {"song_name": song_name, "category": category, "lyrics": song_data}

from flask_restx import Namespace, Resource, fields, reqparse
from app.utils import fetch_bible_versions, fetch_verses, LyricsService


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


################### Need to adjust, I need to get the song id to get the data
@song_ns.route('/<string:category>/<string:artist>/<string:song_name>')
def get_songs():
    service = LyricsService()
    query_results = service.search_lyrics(query="dios es real miel san marcos")
    for result in query_results:
        print(f"ID: {result['id']}, Track: {result['trackName']}, Artist: {result['artistName']}")
    
    if query_results:
        track_id = query_results[0]["id"]  # Obtén el primer resultado
        track_details = service.get_lyrics_by_id(track_id)
        print(track_details)

    @song_ns.doc(params={
        'category': 'Categoría de la canción (lentas o rapidas)',
        'artist': 'Nombre de la banda o cantatne',
        'song_name': 'Nombre del archivo de la canción'
    })
    #@song_ns.marshal_with(song_model)
#########
#########
###########
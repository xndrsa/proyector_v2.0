import requests

BASE_URL = "https://lrclib.net/api"

class LyricsService:
    """
    Clase para interactuar con la API de LRCLIB para letras de canciones.
    """

    @staticmethod
    def get_lyrics(track_name, artist_name, album_name=None, duration=None):
        """
        Obtiene las letras de una canción mediante sus detalles.
        """
        params = {
            "track_name": track_name,
            "artist_name": artist_name,
            "album_name": album_name,
            "duration": duration
        }
        response = requests.get(f"{BASE_URL}/get", params=params)
        if response.status_code == 200:
            return response.json()
        elif response.status_code == 404:
            return {"error": "Track not found"}
        else:
            response.raise_for_status()

    @staticmethod
    def get_lyrics_by_id(lyrics_id):
        """
        Obtiene las letras de una canción mediante su ID único.
        """
        response = requests.get(f"{BASE_URL}/get/{lyrics_id}")
        if response.status_code == 200:
            return response.json()
        elif response.status_code == 404:
            return {"error": "Track not found"}
        else:
            response.raise_for_status()

    @staticmethod
    def search_lyrics(query=None, track_name=None, artist_name=None, album_name=None):
        """
        Busca letras de canciones mediante palabras clave o detalles específicos.
        """
        params = {}
        if query:
            params["q"] = query
        if track_name:
            params["track_name"] = track_name
        if artist_name:
            params["artist_name"] = artist_name
        if album_name:
            params["album_name"] = album_name

        response = requests.get(f"{BASE_URL}/search", params=params)
        if response.status_code == 200:
            return response.json()
        else:
            response.raise_for_status()


# Pruebas
def main():
    service = LyricsService()

    print("=== Búsqueda por palabra clave ===")
    query_results = service.search_lyrics(query="dios esta aqui")
    for result in query_results:
        print(f"ID: {result['id']}, Track: {result['trackName']}, Artist: {result['artistName']}")

    print("\n=== Obtención por ID ===")
    if query_results:
        track_id = query_results[0]["id"]  # Obtén el primer resultado
        track_details = service.get_lyrics_by_id(track_id)
        print(track_details)

if __name__ == "__main__":
    main()

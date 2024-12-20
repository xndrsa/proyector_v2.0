import os
import re
import requests
import json

BIBLES_DIR = './bibles/'

VERSIONS_URL = "https://bible-api.deno.dev/api"

# --- Funciones de la API de la Biblia ---

def fetch_bible_versions():
    url = f"{VERSIONS_URL}/versions"
    response = requests.get(url)
    if response.status_code == 200:
        raw_versions = response.json()
        if raw_versions:
            # Estructura con versiones y endpoints
            versions = []
            endpoints = []

            for idx, version in enumerate(raw_versions):
                version_code = version["name"].replace(" ", "").lower()
                uri = f"/api/read/{version_code}"
                versions.append({
                    "id": idx + 1,  # Usa un índice incremental como id
                    "name": version["name"],
                    "version": version_code,
                    "uri": uri
                })
                endpoints.append(f"{uri}/genesis/1")

            return {
                "versions": versions,
                "endpoints": endpoints
            }
    print(f"Error al obtener versiones de biblias: {response.status_code}")
    return None

def fetch_verses(version, book, chapter, verse, range=None):
    """
    Obtiene uno o más versículos de la Biblia desde la API.
    """
    try:
        if range is None:
            url = f"{VERSIONS_URL}/read/{version}/{book}/{chapter}/{verse}"
        else:
            url = f"{VERSIONS_URL}/read/{version}/{book}/{chapter}/{verse}-{range}"

        response = requests.get(url)

        # Manejo de errores HTTP
        if response.status_code == 200:
            data = response.json()

            # Validar que el formato sea el esperado
            if isinstance(data, list):
                return data  # Rango de versículos
            elif isinstance(data, dict):
                return [data]  # Versículo único como lista
            else:
                print("Formato de respuesta inesperado")
                return None
        else:
            print(f"Error al obtener versículos: {response.status_code}")
            return None

    except Exception as e:
        print(f"Error en fetch_verses: {str(e)}")
        return None





# Cargar el archivo de mapeo de libros
def load_book_mapping():
    try:
        with open("bibles/bibles.json", "r", encoding="utf-8") as file:
            return json.load(file)
    except FileNotFoundError:
        raise Exception("El archivo bibles.json no existe. Por favor, verifica el path.")
    except json.JSONDecodeError:
        raise Exception("Error al decodificar el archivo JSON. Verifica su formato.")


# --- Funciones de la API de las Canciones ---

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

import os
import re
import requests
import json

BIBLES_DIR = './bibles/'
SONGS_DIR = './songs/'

VERSIONS_URL = "https://bible-api.deno.dev/api"

# --- Funciones de la API de la Biblia ---

def fetch_bible_versions():
    url = f"{VERSIONS_URL}/versions"
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
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



# --- Funciones para canciones ---

def load_song(category, song_name):
    file_path = os.path.join(SONGS_DIR, category, f"{song_name}.txt")
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            song_data = file.read().split("\n\n")
            return song_data
    except FileNotFoundError:
        return None
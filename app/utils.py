import os
import re
import requests

BIBLES_DIR = './bibles/'
SONGS_DIR = './songs/'

BASE_URL = "https://bible-api.com"
VERSIONS_URL = "https://bible-api.deno.dev"

# --- Funciones de la API de la Biblia ---

def fetch_bible_versions():
    url = f"{VERSIONS_URL}/versions"
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    print(f"Error al obtener versiones de biblias: {response.status_code}")
    return None

def fetch_books(version):
    url = f"{BASE_URL}/{version}/books"
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    print(f"Error al obtener libros para la versión {version}: {response.status_code}")
    return None

def fetch_verses(version, book, chapter):
    url = f"{BASE_URL}/{version}/{book}/{chapter}/verses"
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    print(f"Error al obtener versículos del capítulo {chapter} del libro {book} en la versión {version}: {response.status_code}")
    return None

# --- Funciones locales para datos de la Biblia ---

def load_bible_version(version, book):
    file_path = os.path.join(BIBLES_DIR, version, f"{book}.txt")
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            bible_data = {}
            for line in file:
                match = re.match(r"\((\d+), (\d+), (\d+), '(.*)'\)", line.strip())
                if match:
                    book_number = int(match.group(1))
                    chapter = int(match.group(2))
                    verse = int(match.group(3))
                    verse_text = match.group(4)
                    bible_data.setdefault(book_number, {}).setdefault(chapter, {})[verse] = verse_text
            return bible_data
    except FileNotFoundError:
        print(f"Archivo local no encontrado: {file_path}. Intentando cargar desde API...")
        return fetch_verses(version, book, 1)  # Cargar el capítulo 1 como ejemplo.

def get_verse(bible_data, book_number, chapter, verse):
    return bible_data.get(book_number, {}).get(chapter, {}).get(verse, "Versículo no encontrado.")

# --- Funciones para canciones ---

def load_song(category, song_name):
    file_path = os.path.join(SONGS_DIR, category, f"{song_name}.txt")
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            song_data = file.read().split("\n\n")
            return song_data
    except FileNotFoundError:
        return None
import subprocess
import time
import os
from flask import Flask, jsonify, request
import requests
import re
from flask_cors import CORS



app = Flask(__name__)

# Directorio donde están las biblias y canciones
BIBLES_DIR = './bibles/'


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

# Cargar el archivo de texto de la Biblia para una versión y libro específico
def load_bible_version(version, book):
    file_path = os.path.join(BIBLES_DIR, version, f"{book}.txt")
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            bible_data = {}
            for line in file:
                # Cada línea tiene el formato (book_number, chapter, verse, 'verse_text')
                # Usamos una expresión regular para extraer los elementos
                match = re.match(r"\((\d+), (\d+), (\d+), '(.*)'\)", line.strip())
                if match:
                    book_number = int(match.group(1))
                    chapter = int(match.group(2))
                    verse = int(match.group(3))
                    verse_text = match.group(4)
                    # Organizar en un diccionario por libro, capítulo y verso
                    if book_number not in bible_data:
                        bible_data[book_number] = {}
                    if chapter not in bible_data[book_number]:
                        bible_data[book_number][chapter] = {}
                    bible_data[book_number][chapter][verse] = verse_text
            return bible_data
    except FileNotFoundError:
        return None

def get_verse(bible_data, book_number, chapter, verse):
    # Buscar el verso dentro de los datos de la Biblia
    return bible_data.get(book_number, {}).get(chapter, {}).get(verse, "Versículo no encontrado.")

@app.route('/bible/<version>/<book>/<chapter>/<verse>', methods=['GET'])
def get_bible_verse(version, book, chapter, verse):
    # Convertir el nombre del libro a su número correspondiente
    book_number = book_name_to_number.get(book.lower())
    if not book_number:
        return jsonify({"error": "Libro no válido."}), 404

    # Cargar los datos de la Biblia para la versión y libro solicitados
    bible_data = load_bible_version(version, book)
    if not bible_data:
        return jsonify({"error": "Versión o libro no encontrados."}), 404

    # Buscar el verso
    try:
        chapter = int(chapter)
        verse = int(verse)
        verse_text = get_verse(bible_data, book_number, chapter, verse)
        return jsonify({"version": version, "book": book, "chapter": chapter, "verse": verse, "text": verse_text})
    except ValueError:
        return jsonify({"error": "El formato del capítulo o verso es incorrecto."}), 400




SONGS_DIR = './songs/'
# Cargar la letra de una canción desde un archivo de texto
def load_song(song_name):
    file_path = os.path.join(SONGS_DIR, f"{song_name}.txt")
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            song_data = file.read().split("\n\n")  # Separar por parráfos (doble salto de línea)
            return song_data
    except FileNotFoundError:
        return None


@app.route('/song/<category>/<song_name>', methods=['GET'])
def get_song_lyrics(category, song_name):
    # Verificar que la categoría sea válida (lentas o rapidas)
    if category not in ['lentas', 'rapidas']:
        return jsonify({"error": "Categoría no válida. Use 'lentas' o 'rapidas'."}), 400

    # Construir la ruta del archivo de la canción
    song_path = os.path.join('songs', category, f"{song_name}.txt")

    if not os.path.exists(song_path):
        return jsonify({"error": "Canción no encontrada."}), 404

    try:
        with open(song_path, 'r', encoding='utf-8') as song_file:
            lyrics = song_file.read().strip().split('\n\n')  # Separar por párrafos
        return jsonify({"song_name": song_name, "category": category, "lyrics": lyrics})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# creating endpoint
def start_ngrok():
    subprocess.Popen(['ngrok', 'http', '5000'], stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    time.sleep(2)  # Espera a que Ngrok se inicie
    # Obtén la URL pública desde la API de Ngrok
    response = requests.get("http://127.0.0.1:4040/api/tunnels")
    tunnels = response.json().get("tunnels", [])
    if tunnels:
        ngrok_url = tunnels[0]["public_url"]
        print(f"Tu URL pública de Ngrok es: {ngrok_url}")
    else:
        print("No se pudo obtener la URL pública de Ngrok.")
    return ngrok_url


if __name__ == "__main__":
    start_ngrok()
    app.run(host='0.0.0.0', port=5000, debug=True)
    CORS(app, resources={r"/*": {"origins": "*"}})


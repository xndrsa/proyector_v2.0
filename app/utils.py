import os
import re

BIBLES_DIR = './bibles/'
SONGS_DIR = './songs/'

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
                    if book_number not in bible_data:
                        bible_data[book_number] = {}
                    if chapter not in bible_data[book_number]:
                        bible_data[book_number][chapter] = {}
                    bible_data[book_number][chapter][verse] = verse_text
            return bible_data
    except FileNotFoundError:
        return None

def get_verse(bible_data, book_number, chapter, verse):
    return bible_data.get(book_number, {}).get(chapter, {}).get(verse, "Versículo no encontrado.")

def load_song(category, song_name):
    file_path = os.path.join(SONGS_DIR, category, f"{song_name}.txt")
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            song_data = file.read().split("\n\n")
            return song_data
    except FileNotFoundError:
        return None

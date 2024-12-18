import os
import re
import requests
BASE_URL = "https://bible-api.com"
VERSIONS_URL = "https://bible-api.deno.dev/api"

# --- Funciones de la API de la Biblia ---

# def fetch_bible_versions():
#     url = f"{VERSIONS_URL}/versions"
#     response = requests.get(url)
#     if response.status_code == 200:
#         return response.json()
#     print(f"Error al obtener versiones de biblias: {response.status_code}")
#     return response.status_code

# a=fetch_bible_versions()
# print(a)
# a = 'genesis'


# info = []
# def fetch_books():
#     url = f"{VERSIONS_URL}/books"
#     response = requests.get(url)
#     if response.status_code == 200:
#         books = response.json()
#         structured_books = {
#             book["abrev"]: {
#                 "names": book["names"],
#                 "chapters": book["chapters"],
#                 "testament": book["testament"],
#             }
#             for book in books
#         }
#         return structured_books
#         #return response.json()

#     print(f"Error al obtener libros para la versión  {response.status_code}")
#     return response.status_code

# b = fetch_books()
# print(b)




# b = 'gn'

# def fetch_verses(version, book, chapter, verse,range=None):
#     if range is None:
#         url = f"{VERSIONS_URL}/read/{version}/{book}/{chapter}/{verse}"
#     else:
#         url = f"{VERSIONS_URL}/read/{version}/{book}/{chapter}/{verse}-{range}"
#     response = requests.get(url)
#     if response.status_code == 200:
#         return response.json()
#     print(f"Error al obtener versículos del capítulo {chapter} del libro {book} en la versión {version}: {response.status_code}")
#     return response.status_code

# c = fetch_verses('rv1960',b,1,1,2)
# print(c)

# rv1960/gn/1/1-2



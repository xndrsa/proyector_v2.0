
EXTERNAL_BIBLE_API_BASE = "https://bible-api.deno.dev/api"

AVAILABLE_VERSIONS = ["rv1960", "rv1995", "nvi", "dhh", "pdt", "kjv"]

APP_VERSION = "1.0.0"

APP_NAME = "ProyektorCF"

SWAGGER_TEMPLATE = {
    "swagger": "2.0",
    "info": {
        "title": APP_NAME,
        "description": "API para acceder a versos de la Biblia y letras de canciones.",
        "version": APP_VERSION
    },
    "basePath": "/",
    "schemes": [
        "http"
    ],
    "securityDefinitions": {},
    "consumes": [
        "application/json"
    ],
    "produces": [
        "application/json"
    ]
}

import os

class Config:
    """Configuración base."""
    DEBUG = False
    TESTING = False
    SECRET_KEY = os.environ.get('SECRET_KEY', 'laweafome')
    RESTX_MASK_SWAGGER = False

class DevelopmentConfig(Config):
    """Configuración para desarrollo."""
    DEBUG = True

class ProductionConfig(Config):
    """Configuración para producción."""
    DEBUG = False

class TestingConfig(Config):
    """Configuración para pruebas."""
    TESTING = True
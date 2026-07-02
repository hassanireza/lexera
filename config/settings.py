"""
Django settings for the Lexera project.

Configured to run locally with SQLite out of the box, and in production
(e.g. Railway) via environment variables + Postgres, with WhiteNoise serving
static files so no separate static host/CDN is required to go live.
"""
from pathlib import Path
import os

import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent

# ---------------------------------------------------------------------------
# Core / environment
# ---------------------------------------------------------------------------
SECRET_KEY = os.environ.get(
    'SECRET_KEY',
    'django-insecure-CHANGE-ME-IN-PRODUCTION-lexera-2026'
)

# DEBUG defaults to False so a missing env var never accidentally exposes
# a production site. Set DEBUG=True locally (see .env.example).
DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'

ALLOWED_HOSTS = [h.strip() for h in os.environ.get('ALLOWED_HOSTS', '*').split(',') if h.strip()]

# Railway exposes the public domain here; auto-trust it for CSRF + hosts.
RAILWAY_PUBLIC_DOMAIN = os.environ.get('RAILWAY_PUBLIC_DOMAIN')
RAILWAY_STATIC_URL = os.environ.get('RAILWAY_STATIC_URL')
_extra_hosts = [h for h in (RAILWAY_PUBLIC_DOMAIN, RAILWAY_STATIC_URL) if h]
if _extra_hosts and ALLOWED_HOSTS != ['*']:
    ALLOWED_HOSTS += _extra_hosts

CSRF_TRUSTED_ORIGINS = [o.strip() for o in os.environ.get('CSRF_TRUSTED_ORIGINS', '').split(',') if o.strip()]
if RAILWAY_PUBLIC_DOMAIN:
    CSRF_TRUSTED_ORIGINS.append(f'https://{RAILWAY_PUBLIC_DOMAIN}')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.humanize',

    # Lexera apps
    'core',
    'accounts',
    'vocabulary',
    'learning',
    'games',
    'gamification',
    'social',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'gamification.middleware.DailyRefreshMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'core.context_processors.brand',
                'gamification.context_processors.player_stats',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# ---------------------------------------------------------------------------
# Database — Postgres via DATABASE_URL (Railway sets this automatically when
# you attach a Postgres plugin), falling back to local SQLite otherwise.
# ---------------------------------------------------------------------------
DATABASES = {
    'default': dj_database_url.config(
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}",
        conn_max_age=600,
        conn_health_checks=True,
    )
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', 'OPTIONS': {'min_length': 8}},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

AUTH_USER_MODEL = 'accounts.User'
LOGIN_URL = 'accounts:login'
LOGIN_REDIRECT_URL = 'core:dashboard'
LOGOUT_REDIRECT_URL = 'core:landing'

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# ---------------------------------------------------------------------------
# Static & media — WhiteNoise serves compressed, hashed static files directly
# from the Django process, so Railway needs no separate static host.
# ---------------------------------------------------------------------------
STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / 'static']
STATIC_ROOT = BASE_DIR / 'staticfiles'
STORAGES = {
    'default': {'BACKEND': 'django.core.files.storage.FileSystemStorage'},
    'staticfiles': {
        'BACKEND': (
            'whitenoise.storage.CompressedManifestStaticFilesStorage'
            if not DEBUG else
            'django.contrib.staticfiles.storage.StaticFilesStorage'
        )
    },
}

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ---------------------------------------------------------------------------
# Security — tightened automatically whenever DEBUG is off (i.e. in prod).
# ---------------------------------------------------------------------------
if not DEBUG:
    SECURE_SSL_REDIRECT = os.environ.get('SECURE_SSL_REDIRECT', 'True').lower() == 'true'
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 60 * 60 * 24 * 7  # 1 week; raise once confident
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'

# ---------------------------------------------------------------------------
# Logging — plain stdout logging so Railway's log viewer captures everything.
# ---------------------------------------------------------------------------
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {'console': {'class': 'logging.StreamHandler'}},
    'root': {'handlers': ['console'], 'level': 'INFO'},
}

# ---------------------------------------------------------------------------
# Lexera game economy constants
# ---------------------------------------------------------------------------
LEXERA = {
    'START_LIVES': 5,
    'MAX_LIVES': 5,
    'LIFE_REGEN_MINUTES': 30,       # 1 life every 30 min
    'STREAK_FREEZE_COST': 200,      # coins
    'DOUBLE_XP_BOOST_COST': 150,
    'DOUBLE_XP_BOOST_MINUTES': 15,
    'XP_PER_CORRECT': 10,
    'XP_LESSON_COMPLETE_BONUS': 25,
    'XP_PERFECT_LESSON_BONUS': 15,
    'COINS_PER_LESSON': 10,
    'COINS_PER_PERFECT_LESSON': 20,
}

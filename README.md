# Lexera — Level up your words 🦊

A gamified English vocabulary learning app built with **Django**, vanilla **JavaScript**, and a
custom mobile-first design system. Inspired by best practices from Duolingo (streaks, lives,
path-based lessons), Headspace (soft, calm shapes) and Linear (grid precision).

## What's inside

**Learning content**
- 5 difficulty levels ("Roots" → "Summit"), 40 seeded lessons, 60+ curated words each with
  IPA pronunciation, part of speech, definition, example sentence, **etymology / word history,
  origin language, first known use and a fun fact**.

**Game types (8)**
| Type | File | Description |
|---|---|---|
| Quiz | `games/quiz.html` | Multiple-choice "what does X mean?" |
| Typing recall | `games/typing.html` | Type the word from its definition |
| Wordle | `games/wordle.html` | Classic 6-guess word game, server-validated |
| Drag & drop | `games/dragdrop.html` | Match words to definitions (touch + mouse) |
| Synonym connections | `games/connections.html` | Tap-to-connect matching with SVG lines |
| Word Sudoku | `games/sudoku.html` | 9×9 sudoku using letters instead of digits |
| Word history | `games/history.html` | Etymology reading cards |
| Level test | `games/quiz.html` | Bigger quiz, higher pass bar |

**Gamification**
- XP & levelling curve, coins, **lives** (regenerate over time, lose one per mistake)
- **Daily streaks** with streak-freeze protection (purchasable)
- Boosts (Double XP), a coin **store**, badges
- Birthday balloons on a player's profile on their birthday 🎈

**Social**
- Username/email auth (Django auth, custom `User` model)
- Follow / unfollow, friends list, friend search
- Leaderboard (friends & global)
- `Challenge` model scaffolded for head-to-head duels

**Design / mobile app feel**
- Full custom design system in `static/css/lexera.css` (`--indigo-600` primary,
  `--coral-500` accent, `Baloo 2` display font + `Outfit` body font)
- Bottom tab bar, sticky top stat bar — behaves like a native app
- Installable **PWA**: `manifest.json`, service worker, offline page, custom icons
- Fully responsive; centers as a phone-width column on desktop

## Deploying to Railway

This repo is Railway-ready out of the box (`Procfile`, `railway.json`, `runtime.txt`,
WhiteNoise for static files, Postgres support via `DATABASE_URL`).

1. **Push this folder to a GitHub repo** (or use the Railway CLI to deploy the folder
   directly with `railway up`).
2. In Railway: **New Project → Deploy from GitHub repo** and select it.
3. **Add a PostgreSQL database**: New → Database → PostgreSQL. Railway automatically
   injects `DATABASE_URL` into your web service — no extra config needed.
4. **Set environment variables** on the web service (Settings → Variables):
   - `SECRET_KEY` — generate one, e.g. `python -c "import secrets; print(secrets.token_urlsafe(50))"`
   - `DEBUG` = `False`
   - `ALLOWED_HOSTS` = `your-app.up.railway.app` (or your custom domain)
   - `CSRF_TRUSTED_ORIGINS` = `https://your-app.up.railway.app`
   - (Railway also exposes `RAILWAY_PUBLIC_DOMAIN` automatically, which `settings.py`
     already reads to extend `ALLOWED_HOSTS`/`CSRF_TRUSTED_ORIGINS` as a fallback.)
5. **Deploy.** Railway builds with Nixpacks from `requirements.txt`, then runs the
   command in `Procfile` / `railway.json`, which on every deploy will:
   - run migrations (`migrate --noinput`)
   - seed/refresh vocabulary content (`seed_lexera` — idempotent, safe to re-run)
   - collect static files (`collectstatic --noinput`, served by WhiteNoise)
   - start `gunicorn`
6. **Create an admin user** once it's live, via the Railway shell:
   `railway run python manage.py createsuperuser`
7. Visit your Railway URL — the landing page should load, and `/admin/` will let you
   manage words, lessons, badges and store items.

**Custom domain:** add it under Settings → Networking, then add it to `ALLOWED_HOSTS`
and `CSRF_TRUSTED_ORIGINS` too.

**Note:** the security hardening in `settings.py` (secure cookies, HSTS, SSL redirect)
only activates when `DEBUG=False`, and assumes traffic reaches Django via Railway's
HTTPS-terminating proxy (handled by `SECURE_PROXY_SSL_HEADER`). Testing those flags
against `http://127.0.0.1` locally will trip CSRF/cookie checks — that's expected;
run locally with `DEBUG=True` (the default in `.env.example` for local use).

## Getting started

```bash
python3 -m venv venv
source venv/bin/activate        # venv\Scripts\activate on Windows
pip install -r requirements.txt

export DEBUG=True               # local dev only — set -Env:DEBUG="True" on Windows PowerShell
python manage.py migrate
python manage.py seed_lexera    # loads words, levels, lessons, store items, badges
python manage.py createsuperuser

python manage.py runserver
```

Visit `http://127.0.0.1:8000/`. A demo account is not created automatically — sign up from
the landing page, or create one via `createsuperuser` / the admin at `/admin/`.

## Project layout

```
config/          settings, root urls
core/            landing page, dashboard (lesson path), PWA routes
accounts/        custom User model, auth, profile, follow, leaderboard, store
learning/        Level, Lesson, LessonProgress models
vocabulary/      Word, WordOfDay models + seed_lexera management command
games/           gameplay views + puzzle-generation logic (games/logic.py)
social/          Follow, Challenge models
gamification/    Boost, Badge, XPEvent, StoreItem, life-regen middleware
static/css/lexera.css   full design system
static/js/app.js        shared confetti / balloons / API helpers
templates/       all HTML, one folder per app
```

## Notes on production-readiness

This is a complete, runnable Django application with real working gameplay, persistence,
and a genuinely designed UI — not a mockup. Before a public launch you'd still want to:

- Swap SQLite for Postgres and set `DEBUG=False`, a real `SECRET_KEY`, and `ALLOWED_HOSTS`
  via environment variables (the settings file already reads from `os.environ`).
- Put it behind Gunicorn/Uvicorn + Nginx (or a PaaS) and serve static files via
  `collectstatic` + whitenoise/S3/CDN.
- Add rate limiting on the auth endpoints and the wordle/sudoku session endpoints.
- Expand anti-cheat on the client-scored games (quiz/typing score the attempt client-side
  then POST a summary — fine for a casual product, but a determined user could forge the
  finish request; wordle/sudoku are already server-validated).
- Add automated tests, CI, and error monitoring (Sentry).
- Flesh out the `Challenge` (friend duel) flow with real-time updates and the badge-award
  triggers (currently seeded but not yet auto-granted).

## Brand quick reference

- **Primary**: Indigo `#4F46E5` · **Accent**: Coral `#FF6B52` · **Success**: Mint `#12B886`
  · **Streak/Gold**: Amber `#F5A623`
- **Display font**: Baloo 2 (rounded, playful headings) · **Body font**: Outfit
- **Logo**: abstract "L" formed like an open book with a coral notch, in `static/img/logo.svg`

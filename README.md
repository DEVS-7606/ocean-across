# Ocean Across — Sessions Marketplace

A full-stack web application where creators can publish sessions and users can browse and book them.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router, client-side) + TypeScript + Tailwind CSS + shadcn/ui |
| Backend | Django 5 + Django REST Framework |
| Database | PostgreSQL 16 |
| Auth | GitHub OAuth via python-social-auth + JWT (djangorestframework-simplejwt) |
| Infrastructure | Docker Compose (4 containers) + Nginx reverse proxy |
| Rate Limiting | django-ratelimit on booking and auth endpoints |

## Quick Start

### Prerequisites
- Docker & Docker Compose installed
- GitHub OAuth App (see setup below)

### 1. Clone & Configure

```bash
git clone <your-repo-url>
cd ocean-across
cp .env.example .env
```

Edit `.env` and fill in your GitHub OAuth credentials:

```env
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-client-secret
```

### 2. Run

```bash
docker compose up --build
```

That's it. Visit **http://localhost** when all containers are healthy (~60s on first run).

### 3. Admin panel

```bash
docker compose exec backend python manage.py createsuperuser
```

Visit http://localhost/admin

---

## GitHub OAuth App Setup

1. Go to **GitHub → Settings → Developer settings → OAuth Apps → New OAuth App**
2. Fill in:
   - **Application name:** Ocean Across
   - **Homepage URL:** `http://localhost`
   - **Authorization callback URL:** `http://localhost/social-auth/complete/github/`
3. Copy `Client ID` and `Client Secret` into your `.env` file

---

## Architecture

```
                    ┌─────────┐
                    │  Nginx  │ :80
                    └────┬────┘
              ┌──────────┴──────────┐
              │                     │
         ┌────▼─────┐         ┌─────▼──────┐
         │ Frontend │         │  Backend   │
         │ Next.js  │         │  Django    │
         │  :3000   │         │  DRF :8000 │
         └──────────┘         └─────┬──────┘
                                    │
                              ┌─────▼──────┐
                              │ PostgreSQL  │
                              │   :5432    │
                              └────────────┘
```

**Request routing via Nginx:**
- `/api/*` → Django backend
- `/social-auth/*` → Django (OAuth flow)
- `/admin/*` → Django admin
- `/*` → Next.js frontend

---

## API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/auth/github/` | — | Initiate GitHub OAuth |
| GET | `/api/auth/me/` | JWT | Get current user |
| PATCH | `/api/auth/profile/` | JWT | Update name/avatar |
| POST | `/api/auth/role/` | JWT | Set user role |
| POST | `/api/auth/token/refresh/` | Refresh token | Get new access token |
| POST | `/api/auth/logout/` | — | Blacklist refresh token |

### Sessions
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/sessions/` | — | Public catalog |
| GET | `/api/sessions/:id/` | — | Session detail |
| GET | `/api/sessions/creator/` | Creator | Own sessions |
| POST | `/api/sessions/creator/` | Creator | Create session |
| PATCH/DELETE | `/api/sessions/creator/:id/` | Creator (owner) | Update/delete |
| GET | `/api/sessions/creator/bookings/` | Creator | Bookings on own sessions |

### Bookings
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/bookings/` | User | Own bookings |
| POST | `/api/bookings/sessions/:id/book/` | User | Book a session (rate-limited: 10/min) |
| DELETE | `/api/bookings/:id/cancel/` | User (owner) | Cancel booking |

---

## Demo Flow

### As a User
1. Visit http://localhost
2. Click **Sign in with GitHub** → authorize
3. Select **"I want to learn"** on role page
4. Browse sessions on the home page
5. Click a session → **Book Now**
6. View booking in **My Dashboard**

### As a Creator
1. Sign in with GitHub
2. Select **"I want to create"**
3. Go to **Creator Dashboard** → **New Session**
4. Fill in title, description, price, date/time, capacity
5. Users can now find and book your session
6. View all bookings under **Bookings Received** tab

---

## Environment Variables

See `.env.example` for full list with descriptions.

Key variables:

| Variable | Description |
|---|---|
| `DJANGO_SECRET_KEY` | Django secret — generate with `python -c "import secrets; print(secrets.token_urlsafe(50))"` |
| `GITHUB_CLIENT_ID` | From GitHub OAuth App settings |
| `GITHUB_CLIENT_SECRET` | From GitHub OAuth App settings |
| `POSTGRES_*` | Database connection config |
| `NEXT_PUBLIC_API_URL` | Backend API URL (default: http://localhost/api) |

---

## AI Prompt Log

See [PROMPTS.md](./PROMPTS.md) for the complete log of AI-assisted prompts used during development.

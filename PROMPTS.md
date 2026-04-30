# AI Prompt Log — Ocean Across Assignment

This file documents all AI-assisted prompts used during this project, what was taken from responses, and what was manually adjusted.

---

## Prompt #1 — Project Architecture & Planning

**Date:** 2026-04-29
**Tool:** Claude Code (claude-sonnet-4-6)

**Prompt:**
> "Read the Ocean Across FullStack Dev Assignment PDF and my resume. Based on both, design a complete execution plan — architecture, phases, tech choices tailored to my background (React/Next.js/TypeScript focused, Django is new), and scoring strategy."

**What I used from the response:**
- 4-container Docker architecture (frontend, backend, db, nginx)
- Phase-by-phase execution plan (scaffold → auth → APIs → frontend → polish)
- Choice of GitHub OAuth over Google (simpler OAuth app setup)
- Decision to use python-social-auth + djangorestframework-simplejwt
- Scoring optimization strategy (prioritize Auth+Roles and Core Features)
- Recommendation to include rate limiting for bonus points

**What I changed/adjusted:**
- Chose Razorpay over Stripe as bonus (more relevant for India)
- Decided to tackle rate limiting first (easiest bonus)

---

## Prompt #2 — Full Project Scaffold

**Date:** 2026-04-29
**Tool:** Claude Code (claude-sonnet-4-6)

**Prompt:**
> "Build the complete project: Django backend with accounts/sessions_app/bookings apps, Next.js 16 frontend with shadcn/ui, Docker Compose with 4 containers, Nginx reverse proxy config, auth flow with GitHub OAuth + JWT, all REST endpoints, and all frontend pages."

**What I used from the response:**
- Custom Django User model extending AbstractBaseUser with role field
- `social_django` pipeline with custom `save_avatar` step
- JWT token embedding role+email into payload
- DRF permission classes: IsAuthenticated, IsCreator, IsSessionCreator
- `select_for_update()` transaction pattern for concurrent booking safety
- Zustand store with `persist` middleware for token management
- Axios interceptor pattern for auto-refresh on 401
- Next.js 16 `use(params)` pattern for async params
- Docker Compose healthcheck + `condition: service_healthy` for startup ordering

**What I changed/adjusted:**
- Adjusted redirect URLs after role selection to go to correct dashboards
- Added `isFuture()` check for active vs past bookings in User Dashboard
- Added optimistic feedback (sonner toasts) throughout
- Customized session card with India price format (₹ and `en-IN` locale)

---

## Prompt #3 — Architectural Refactoring (Layered Architecture + Atomic Design + SOLID)

**Date:** 2026-04-29
**Tool:** Claude Code (claude-sonnet-4-6)

**Prompt:**
> "Refactor the codebase to implement proper coding practices: layered architecture, atomic design, clean code, SRP principles, and SOLID principles. Backend views are doing too much — mix of HTTP handling, business logic, and DB queries."

**What I used from the response:**

*Backend — Layered Architecture:*
- `services.py` per app: `AuthService`, `SessionService`, `BookingService` — all business logic moved out of views
- Views reduced to pure HTTP handlers: validate input → call service → return response
- SRP applied: each service method has a single responsibility (e.g. `BookingService.book_session` handles only booking rules)
- OCP applied: to add new booking behaviour (e.g. payment check), extend `BookingService` without touching the view
- DIP applied: views depend on service abstraction, not on `Booking.objects` directly

*Frontend — Atomic Design:*
- `components/atoms/` — `EmptyState`, `PriceLabel`, `StatusBadge` (single-purpose, no logic)
- `components/molecules/` — `SessionCard`, `BookingRow`, `StatCard` (one concept, composed from atoms)
- `components/organisms/` — `SessionGrid`, `Navbar` (one feature area, composed from molecules)

*Frontend — Service + Hook layers:*
- `services/sessions.service.ts`, `bookings.service.ts`, `auth.service.ts` — all API contracts in one place (DIP: components never call `api.get()` directly)
- `hooks/useSessions.ts`, `useBookings.ts`, `useAuth.ts` — TanStack Query wrappers per domain (SRP: hooks own data fetching, components own rendering)
- Pages reduced to pure composition — no inline API calls, no business logic

**What I changed/adjusted:**
- Kept the `select_for_update()` concurrency pattern in `BookingService` (understood and verified it)
- Added `StatusBadge` atom to centralise the variant-to-status mapping (was scattered across 4 files)
- Extracted `SessionFormData` interface and `EMPTY_FORM` constant to make the form state explicit
- Split Creator Dashboard into sub-components: `SessionsTab`, `BookingsTab`, `SessionFormDialog` (each single responsibility)

---

## Prompt #4 — Pre-submission Audit & Critical Bug Fixes

**Date:** 2026-04-29
**Tool:** Claude Code (claude-sonnet-4-6)

**Prompt:**
> "Do an honest audit of the project before submission. What's broken, what's missing, and what's the real score?"

**What I used from the response:**

*Critical fixes identified and applied:*
- **Missing migrations** — `makemigrations` never ran; Docker would boot with no tables. Generated `0001_initial.py` for all 3 apps.
- **OAuth redirect bug** — `SOCIAL_AUTH_LOGIN_REDIRECT_URL` pointed to frontend directly with no JWT tokens. Added `oauth_redirect` view: issues JWT then redirects to frontend with tokens in query params.
- **URL ordering conflict** — `creator/bookings/` was defined after `creator/<int:pk>/` in `sessions_app/urls.py`. Django would match `bookings` as a pk. Fixed ordering: specific paths before parameterised paths.
- **Orphaned component files** — `Navbar.tsx`, `SessionCard.tsx`, `SessionCardSkeleton.tsx` left in root `components/` after Atomic Design refactor. Removed.

**What I changed/adjusted:**
- Understood why URL ordering matters in Django (first-match routing, unlike Express which is also first-match but with explicit wildcards)
- Verified the `oauth_redirect` view pattern by tracing the social-django pipeline flow

---

## Prompt #5 — Docker & UI Bug Fixes (Live Testing)

**Date:** 2026-04-30
**Tool:** Claude Code (claude-sonnet-4-6)

**Prompt:**
> "The app is running but UI looks completely unstyled/dark. OAuth redirect is still going to localhost:3000 instead of localhost."

**What I used from the response:**

*OAuth redirect fix:*
- `FRONTEND_BASE` in `accounts/views.py` was set to `http://localhost:3000` — the internal Docker port, not accessible from the browser. Changed to `http://localhost` (nginx port 80).
- Lesson: in Docker, container ports are internal. Only nginx's port 80 is exposed to the host.

*CSS/UI fix:*
- Root cause: `globals.css` only defined `--background` and `--foreground`. shadcn/ui components use ~20 CSS variables (`--primary`, `--card`, `--border`, `--ring`, `--muted`, etc.). All were resolving to `transparent` or `black`.
- Additionally, `@media (prefers-color-scheme: dark)` was overriding the background to `#0a0a0a` since OS was in dark mode.
- Fix: defined all required shadcn CSS variables in `:root` and removed the dark media query to enforce the light theme explicitly.

**What I changed/adjusted:**
- Chose to force light mode (no dark mode) rather than implement both — keeps the submission clean and focused
- Mapped all shadcn variables to slate palette values to stay consistent with the rest of the design

---

## Prompt #6 — Role Selection Skipped for New Users

**Date:** 2026-04-30
**Tool:** Claude Code (claude-sonnet-4-6)

**Prompt:**
> "After authorization login it directly sets login user as default user and does not ask for role."

**Root cause identified:**
- `role` field in `accounts/models.py` had `default='user'` — so every new user created via GitHub OAuth got a role immediately
- `oauth_redirect` view checks `needs_role = not user.name or not user.role` — since role was always `'user'` (non-empty), this was always `False`
- Result: all new users skipped `/select-role` and landed on the home page as a User with no choice given

**Fix applied:**
- Changed `accounts/models.py` line 32:
  ```python
  # Before
  role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
  # After
  role = models.CharField(max_length=10, choices=ROLE_CHOICES, blank=True, default='')
  ```
- New users now get `role=''` on creation → `not user.role` is `True` → correctly redirected to `/select-role`
- Returning users (role already set to `'user'` or `'creator'`) are unaffected — they still skip role selection
- No new migration needed — Django model defaults are Python-level only, not a DB schema change

**What I changed/adjusted:**
- Nothing — understood the root cause (model field default propagating into the needs_role check) and verified the fix before applying

---

## Prompt #7 — Database Inspection & User Cleanup

**Date:** 2026-04-30
**Tool:** Kiro CLI (claude-sonnet-4-6)

**Prompt:**
> "I want to see db for this" → followed by "remove both users" and "clear the cache also"

**What was done:**
- Queried PostgreSQL via `docker compose exec db psql` to inspect `accounts_user`, `sessions_app_session`, and `bookings_booking` tables
- Found 2 users (both `role='user'`), 0 sessions, 0 bookings
- Deleted both users and their associated `social_auth_usersocialauth` and `token_blacklist_outstandingtoken` records
- Flushed Django sessions (`django_session` table) and blacklisted tokens

**What I learned:**
- How to inspect and manage the live database through Docker exec + psql
- Social auth records and token records need to be cleaned alongside user records

---

## Prompt #8 — Role Selection Still Skipped (Frontend Cache Bug)

**Date:** 2026-04-30
**Tool:** Kiro CLI (claude-sonnet-4-6)

**Prompt:**
> "Still now also its not asking for role, can you analysis this problem?"

**Root cause identified:**
- After deleting users from DB, the browser's **localStorage still had the old Zustand auth store** (`ocean-auth` key) with cached `role: 'user'`
- The `/auth/callback` page checked `data.role` from the cached state and redirected to `/dashboard` without checking the fresh API response
- The Django backend redirect to `/select-role` was correct, but the frontend callback path also needed the same guard

**Fix applied:**
- Updated `auth/callback/page.tsx` to check `data.role` from the fresh `/auth/me/` API response — if role is empty, redirect to `/select-role` instead of dashboard

**What I learned:**
- Zustand's `persist` middleware writes to localStorage — stale cached state can override fresh backend responses
- Both backend redirect and frontend callback need to independently guard for missing role

---

## Prompt #9 — GitHub OAuth Always Logs In Same Account

**Date:** 2026-04-30
**Tool:** Kiro CLI (claude-sonnet-4-6)

**Prompt:**
> "When I change the login account in GitHub then also it login with same account"

**Root cause identified:**
- GitHub OAuth caches the authorized session — it auto-authorizes with the previously logged-in GitHub account without showing the account picker

**Fix applied:**
- Added `'login': ''` to the GitHub auth extra params in `settings.py` (`SOCIAL_AUTH_GITHUB_AUTH_EXTRA_ARGUMENTS`)
- This forces GitHub to show the login/account selection screen every time

**What I learned:**
- GitHub OAuth's default behavior skips the account picker if a session exists
- The `login=''` parameter forces the consent/login screen

---

## Prompt #10 — Second GitHub Account Links to Same User (python-social-auth Session Bug)

**Date:** 2026-04-30
**Tool:** Kiro CLI (claude-sonnet-4-6)

**Prompt:**
> "I have already login with both the user but here its still showing one" (selecting devshah-at on GitHub still logged in as devs95471@gmail.com)

**Root cause identified (two layers):**

1. **Django session not flushed before OAuth** — `python-social-auth`'s default behavior: when a user is already logged in via a Django session and authorizes with a different GitHub account, it **associates** the new social account with the existing user instead of creating a new one. Both GitHub UIDs ended up linked to the same `accounts_user` row.

2. **Stale build arg in `docker-compose.yml`** — Even after adding a session-flushing `/api/auth/github/` endpoint, the frontend was still hitting `/social-auth/login/github/` directly because `docker-compose.yml` had the old URL hardcoded as a build arg (`NEXT_PUBLIC_GITHUB_OAUTH_URL`), overriding the `.env` file.

**Fixes applied:**
- Added `/api/auth/github/` view (`oauth_start`) in `accounts/views.py` that calls `request.session.flush()` before redirecting to GitHub OAuth — ensures each OAuth flow starts with a clean session
- Updated `docker-compose.yml` build arg to `http://localhost/api/auth/github/` so the frontend uses the session-flushing endpoint
- Updated `.env` and `NEXT_PUBLIC_GITHUB_OAUTH_URL` to match
- Cleaned up wrongly associated `social_auth_usersocialauth` records in the DB

**What I learned:**
- `python-social-auth` associates new social accounts with the currently logged-in Django session user — session must be flushed before starting a new OAuth flow
- Next.js `NEXT_PUBLIC_*` env vars are baked at **Docker build time** via `args` in `docker-compose.yml`, not read from `.env` at runtime — the build arg overrides the `.env` file
- Always verify the built bundle contains the correct env values after changing build args

---

## Prompt #11 — Test Scenario 1.1: User Role Redirect Fix

**Date:** 2026-04-30
**Tool:** Kiro CLI (claude-sonnet-4-6)

**Prompt:**
> "As per TEST_SCENARIO file Auth workflow 1.1 Expected to redirect to catalog page but it redirected to dashboard"

**Root cause identified:**
- `select-role/page.tsx` redirected users who picked "I want to learn" to `/dashboard` instead of `/` (home/catalog)
- `auth/callback/page.tsx` also redirected returning users with role `user` to `/dashboard` instead of `/`
- Docker build cache was serving stale JS bundles even after source changes — `docker compose up --build` wasn't enough

**Fixes applied:**
- Changed `select-role/page.tsx`: `router.replace('/dashboard')` → `router.replace('/')`
- Changed `auth/callback/page.tsx`: same fix for returning users
- Used `docker compose build --no-cache frontend` to force a clean rebuild

**What I learned:**
- Docker layer caching can silently serve stale builds — `--no-cache` is needed when source file changes aren't picked up
- Always verify the built JS bundle inside the container matches the source change

---

## Prompt #12 — Test Scenario 1.4: Logout Flow Fix

**Date:** 2026-04-30
**Tool:** Kiro CLI (claude-sonnet-4-6)

**Prompt:**
> "Can you go through 1.4" (Logout test scenario)

**Root cause identified:**
- Logout only cleared Zustand local state — never called the backend `/api/auth/logout/` endpoint to blacklist the refresh token
- No redirect to home after logout

**Fix applied:**
- Updated `Navbar.tsx` logout handler to:
  1. Call `AuthService.logout(refreshToken)` to blacklist the token on the backend
  2. Clear local Zustand state
  3. Redirect to `/` via `router.replace('/')`

---

## Prompt #13 — Session Capacity vs Spots Remaining Data Integrity

**Date:** 2026-04-30
**Tool:** Kiro CLI (claude-sonnet-4-6)

**Prompt:**
> "Show me session table" → analysis revealed `spots_remaining` (10) > `capacity` (1) mismatch

**Root cause identified:**
- The `save()` method on the Session model only set `spots_remaining = capacity` on creation (`if not self.pk`)
- Updating capacity after creation did not adjust `spots_remaining`, causing data inconsistency

**Fixes applied:**
- Fixed existing data: synced `spots_remaining` to match `capacity` for all sessions
- Updated `Session.save()` to detect capacity changes and adjust `spots_remaining` proportionally: `spots_remaining = new_capacity - booked_count`
- Added validation: if new capacity < current bookings, raises `ValueError` with message "Cannot reduce capacity below N (current bookings)"
- Updated `CreatorSessionDetailView.update()` to return HTTP 400 for capacity validation errors (was returning 404)

---

## Prompt #14 — Backend Error Messages in Frontend Toasts

**Date:** 2026-04-30
**Tool:** Kiro CLI (claude-sonnet-4-6)

**Prompt:**
> "Get error from backend everywhere"

**What was done:**
- Updated all `onError` handlers in frontend hooks to show the backend's specific error message instead of generic fallbacks
- Files changed: `hooks/useSessions.ts` (create, update, delete) and `hooks/useBookings.ts` (cancel)
- Pattern: `(err: any) => toast.error(err?.response?.data?.error || 'Fallback message')`

---

## Prompt #15 — Cancelled Booking Rebook Error Message

**Date:** 2026-04-30
**Tool:** Kiro CLI (claude-sonnet-4-6)

**Prompt:**
> "If User has booked a session and cancels it, the spot gets empty but if they try again it shows booking failed — show more specific error"

**Root cause identified:**
- `Booking` model has `unique_together = ('session', 'user')` — after cancellation, the row still exists with `status='cancelled'`
- The duplicate check only looked for `status='confirmed'`, so it passed, but `Booking.objects.create()` hit the unique constraint causing an unhandled `IntegrityError`

**Fix applied:**
- Updated `BookingService.book_session()` to check for any existing booking (confirmed or cancelled)
- If confirmed: "You have already booked this session."
- If cancelled: "You previously cancelled this booking and cannot rebook the same session."

---

## Prompt #16 — Confirmation Dialogs for Delete & Cancel Actions

**Date:** 2026-04-30
**Tool:** Kiro CLI (claude-sonnet-4-6)

**Prompt:**
> "Of every delete and cancel button click open a confirmation model first"

**What was done:**
- Created reusable `ConfirmDialog` component (`components/molecules/ConfirmDialog.tsx`) using existing shadcn `Dialog`
- Added confirmation dialog to **Delete Session** button in Creator Dashboard — "This will permanently delete this session and all its bookings."
- Added confirmation dialog to **Cancel Booking** button in User Dashboard — "Cancel your booking for '{title}'? You won't be able to rebook this session."
- Dialog stays open if the action fails; closes only on success

---

## Prompt #17 — Rate Limiting Fix (Test Scenario 5.1)

**Date:** 2026-04-30
**Tool:** Kiro CLI (claude-sonnet-4-6)

**Prompt:**
> "I want to test 5.1 from Test scenario file" (Booking endpoint rate limit 10 req/min)

**Root cause identified (three layers):**

1. **`django-ratelimit` decorator incompatible with DRF** — `@ratelimit` decorator runs before DRF wraps the request. The `request.limited` flag was set on the raw Django `HttpRequest`, but DRF creates its own `Request` wrapper, so the flag was never seen.

2. **`LocMemCache` is per-process** — Gunicorn runs 2 workers, each with its own in-memory cache. Requests were load-balanced across workers, so each worker only saw ~6 of 12 requests — never hitting the limit of 10.

3. **`is_ratelimited()` with `request._request`** — Passing the underlying Django request worked for the rate check, but the `Ratelimited` exception was caught by DRF as a generic permission error (403 instead of 429).

**Fixes applied:**
- Replaced `django-ratelimit` with DRF's built-in `UserRateThrottle` — works natively with DRF's request object
- Switched cache backend from `LocMemCache` to `DatabaseCache` (`django.core.cache.backends.db.DatabaseCache`) — shared across all gunicorn workers
- Added `createcachetable` to the backend Dockerfile CMD for automatic cache table creation on startup
- Added custom DRF exception handler (`core/exceptions.py`) to return `429` with `{"error": "Too many requests."}` instead of DRF's default throttle response

**Test result:**
- Requests 1–10: `200`/`400` (success or validation error, NOT 429) ✅
- Requests 11–12: `429 Too Many Requests` ✅

---

## Prompt #18 — Architecture Audit & High-Severity Fixes

**Date:** 2026-04-30
**Tool:** Kiro CLI (claude-sonnet-4-6)

**Prompt:**
> "Check whether Layered Architecture, atomic design, SOLID principles and clean code principles are properly been followed"

**What was done:**
- Ran a full codebase audit (backend: 12 violations, frontend: 15 violations)
- Fixed all 9 high-severity violations:
  1. Moved capacity validation logic from `Session.save()` to `SessionService.update_session()`
  2. Created typed exceptions (`NotFoundError`, `CapacityError`) in `core/service_exceptions.py` — views catch typed exceptions instead of parsing error strings
  3. Moved `CreatorBookingOverview` from sessions_app to bookings app with `BookingService.get_creator_bookings()`
  4. Replaced direct ORM queries in views with service method calls
  5. Extracted `useAuthCallback` and `useSetRole` hooks — auth pages no longer call `api.*` directly
  6. Replaced `(window as any)._searchTimer` global debounce with `useDebouncedValue` hook
- Created `CONVENTIONS.md` with architecture rules for backend (layered), frontend (atomic design + service→hook→component), and SOLID principles

---

## Prompt #19 — MinIO Object Storage (Bonus Feature)

**Date:** 2026-04-30
**Tool:** Kiro CLI (claude-sonnet-4-6)

**Prompt:**
> "Set up MinIO for session thumbnail uploads"

**What was done:**
- Added MinIO container to docker-compose (S3-compatible object storage, ports 9000/9001)
- Added `boto3` + `django-storages` to backend with `S3Boto3Storage` as default file storage
- Added `thumbnail` ImageField to Session model (uploads to `thumbnails/` prefix in MinIO bucket)
- Created `ensure_bucket` management command — auto-creates bucket with public-read policy on startup
- Added `thumbnail_display` serializer field — returns MinIO URL if uploaded, falls back to `thumbnail_url`
- Updated frontend session form with file upload input
- Updated `SessionCard` and session detail page to display uploaded thumbnails
- MinIO console accessible at `http://localhost:9001` (minioadmin/minioadmin)

---

## Summary

| Area | AI-generated | Manually written / verified |
|------|-------------|------------------|
| Django models | ~80% | 20% (field tuning, business rules) |
| DRF views/permissions | ~70% | 30% (endpoint logic, error messages) |
| Service layer (AuthService, SessionService, BookingService) | ~65% | 35% (understood each method, verified transaction patterns) |
| Frontend components (Atomic Design) | ~75% | 25% (UX polish, prop interfaces, responsive tweaks) |
| Frontend service + hook layers | ~70% | 30% (verified query key structure, error handling) |
| Docker/Nginx config | ~85% | 15% (port/volume adjustments, startup ordering) |
| Bug fixes (migrations, OAuth, CSS) | ~50% | 50% (diagnosed root causes, understood each fix) |

All AI-generated code was reviewed, understood, and tested before use. Patterns unfamiliar from my Node.js/Express background (Django ORM, social-auth pipeline, DRF serializers, select_for_update transactions) were cross-referenced with official Django and DRF documentation.

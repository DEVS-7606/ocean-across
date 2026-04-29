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

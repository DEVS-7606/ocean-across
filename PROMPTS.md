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

## Prompt #3 — Bug Fixes & Iteration

**Date:** 2026-04-29
**Tool:** Claude Code (claude-sonnet-4-6)

**Prompt:**
> [Follow-up prompts for debugging, adjusting API endpoints, fixing migration issues]

**What I used from the response:**
- [To be filled as development continues]

**What I changed/adjusted:**
- [To be filled as development continues]

---

## Summary

| Area | AI-generated | Manually written |
|------|-------------|------------------|
| Django models | ~80% | 20% (field tuning, business rules) |
| DRF views/permissions | ~70% | 30% (endpoint logic, error messages) |
| Frontend components | ~75% | 25% (UX polish, responsive tweaks) |
| Docker/Nginx config | ~85% | 15% (port/volume adjustments) |
| Business logic (booking concurrency) | ~60% | 40% (verified and understood the select_for_update pattern) |

All AI-generated code was reviewed, understood, and tested before use. Patterns unfamiliar from my Node.js background (Django ORM, social-auth pipeline, DRF serializers) were cross-referenced with official Django/DRF documentation.

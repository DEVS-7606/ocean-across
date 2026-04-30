# Ocean Across — Coding Conventions

Rules for maintaining consistent architecture across the codebase.

---

## Backend (Django + DRF)

### Layered Architecture

| Layer | Responsibility | Forbidden |
|-------|---------------|-----------|
| **Models** | Schema, field definitions, `Meta`, `__str__`. Only `save()` override allowed: setting defaults on creation. | Business logic, validation rules, DB queries on other models |
| **Services** (`app/services.py`) | All business logic, validation, ORM queries, transactions. | Importing DRF (`Response`, `status`, serializers), HTTP concerns |
| **Views** | HTTP handling only: parse input → call service → return response. | Direct ORM queries (`Model.objects.*`), business conditionals, inline imports |
| **Serializers** | Data validation and transformation. | Business logic, ORM queries |

### Exception Handling

- Define typed exceptions in `core/service_exceptions.py` (e.g., `NotFoundError`, `CapacityError`).
- Services raise typed exceptions — never return HTTP status codes.
- Views catch typed exceptions and map them to HTTP responses.
- Never parse exception message strings to determine status codes.

### App Boundaries

- Views must only import models/serializers from their own app.
- Cross-app logic goes through the other app's service (e.g., sessions view calls `BookingService`, not `Booking.objects`).
- If a view primarily serves another app's domain, move it to that app.

---

## Frontend (Next.js + TypeScript)

### Atomic Design (`components/`)

| Level | Contains | Rules |
|-------|----------|-------|
| **atoms/** | Single-purpose, stateless UI elements | No state, no API calls, no hooks (except `className` forwarding) |
| **molecules/** | One concept, composed from atoms/UI primitives | Minimal UI state only (e.g., `open`/`close`). No API calls. |
| **organisms/** | One feature area, composed from molecules | May use hooks for data. No direct `api.*` calls — use hooks. |
| **ui/** | shadcn/ui primitives | Do not modify. Treat as external library. |

### Service → Hook → Component Pattern

| Layer | Responsibility | Forbidden |
|-------|---------------|-----------|
| **Services** (`services/*.ts`) | API contracts only: `api.get/post/patch/delete` wrappers returning typed data. | UI logic, toast calls, state management, React imports |
| **Hooks** (`hooks/*.ts`) | Wrap services with TanStack Query (`useQuery`/`useMutation`). Handle `onSuccess`/`onError` (toasts, cache invalidation). | Direct `api.*` calls, rendering logic |
| **Pages** (`app/*/page.tsx`) | Pure composition: import hooks + components, wire them together. | Direct `api.*` calls, inline `useMutation`, business logic (filtering, computing totals) |

### Rules

- **No direct `api.*` calls in pages or components.** Always go through a service + hook.
- **No `(window as any)` or global state.** Use proper hooks (e.g., `useDebouncedValue`).
- **No `any` types.** Use types from `types/index.ts`.
- **All `onError` handlers must show backend error messages:** `err?.response?.data?.error || 'Fallback'`.
- **Destructive actions (delete, cancel) require a confirmation dialog** before executing.

---

## General

- **SRP:** Each function/component/class has one reason to change.
- **DIP:** Components depend on hooks, hooks depend on services, services depend on `api`. Never skip layers.
- **No dead code.** Remove unused imports, functions, and files.
- **Consistent naming:** PascalCase for components/classes, camelCase for functions/variables, snake_case for Python.

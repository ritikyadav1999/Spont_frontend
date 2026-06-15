# PROJECT_MEMORY.md — Spont Frontend

> **One file to understand everything.** Read this before touching any code.

---

## Project Purpose

**Spont** (Spontaneous) is a **real-time social discovery PWA** — a mobile-first web app that lets users discover, join, and host spontaneous local events. Think "find what's happening near you right now."

- Brand tagline: *"Move with the pulse of your city."*
- Design identity: **Kinetic Noir** — dark premium aesthetic, coral-orange primary (`#ff8f70`), subtle tertiary blue-purple (`#bebeff`).
- PWA-first: installable, offline-capable, web push notifications.

---

## Architecture Overview

```
Next.js 16 App Router (React 19)
    ├── Route Groups
    │   ├── (app)/     → Auth-gated routes (server-enforced redirect via cookie)
    │   └── (public)/  → Public routes with shared sidebar shell
    ├── Features/      → Domain modules (auth, events, host, notifications, profile…)
    ├── Lib/           → API client, token/user storage, toast, utilities
    ├── Providers/     → React Query, AuthBootstrap, PWA
    └── Components/    → Layout shells, sidebar, toast viewport
```

**Key Architectural Decisions:**
- Feature-sliced structure: every domain owns its `api/`, `components/`, `hooks/`, `schemas/`, `store/`, `types/`.
- Server-side auth guard via **cookie** (`spont.session=1`) at the layout level — no client-only guard leakage.
- Client-side auth hydration via **Zustand** store populated from `localStorage` on mount (`AuthBootstrap`).
- HTTP via **Axios** with a built-in **silent token refresh** interceptor (queued pending requests during refresh).
- Server API responses are normalized at the API layer — components never see raw backend shapes.

---

## Main Modules

| Module | Path | Purpose |
|--------|------|---------|
| **auth** | `src/features/auth/` | Login, register, logout, auth store, JWT management |
| **events** | `src/features/events/` | Discover feed, event detail page, participant management |
| **host** | `src/features/host/` | Create/edit event form, location search (Nominatim) |
| **my-events** | `src/features/my-events/` | "My Pulse" — hosting, attending, memory lane sections |
| **notifications** | `src/features/notifications/` | In-app notifications + Web Push subscription |
| **profile** | `src/features/profile/` | Own profile (auth user) + public profile by userId |
| **feedback** | `src/features/feedback/` | Contact & feedback form |
| **contact-feedback** | `src/features/contact-feedback/` | Page component for the feedback screen |

---

## Database Overview (Frontend Perspective)

There is no frontend database. All state is server-side. Frontend storage:

| Storage | Key | Contents |
|---------|-----|---------|
| `localStorage` | `spont.access_token` | JWT access token (string) |
| `localStorage` | `spont.auth_user` | `AuthUser` object (JSON serialized) |
| `localStorage` | `spont.sidebar.collapsed` | Sidebar collapse preference (`"true"/"false"`) |
| `localStorage` | `spont.pwa.install.dismissed` | PWA install prompt dismissed flag (`"1"`) |
| `document.cookie` | `spont.session` | Session existence flag (`=1`), read by Next.js server layouts |

Token refresh uses an `httpOnly`-style cookie flow — the refresh POST is sent with `withCredentials: true`.

---

## Important Business Logic

### Auth Flow
1. User logs in → `POST /auth/login` → receives `{ token, name, email, ... }`
2. `accessToken` saved to `localStorage`, `user` saved to `localStorage`, session cookie set
3. `AuthBootstrap` on mount reads these and hydrates Zustand `useAuthStore`
4. Server layouts check for `spont.session=1` cookie — missing → redirect to `/login`
5. Axios interceptor attaches `Authorization: Bearer <token>` to every request
6. On `401` → silent refresh via `POST /auth/refresh` (withCredentials) → retry original request

### Event Join Flow
- **OPEN** events: `POST /event/request-join/{token}` → immediate confirmation
- **APPROVAL_REQUIRED** events: same endpoint → goes to pending queue → host approves/rejects
- Only users with `name + gender + phone` in their profile can join (enforced client-side)

### Participant Role Hierarchy
`HOST > CO_HOST/COHOST > MEMBER`
- Host/Co-host can: approve pending, reject, promote to co-host
- All roles visible in event detail page

### Host Authorization Check (Edit)
The edit page decodes the JWT `sub` claim client-side (no library, manual base64 decode) to confirm the current user is the event creator before rendering the edit form.

### Notification Polling
Notifications poll every **60 seconds** with `refetchIntervalInBackground: true`. Unread badge shows in sidebar and mobile header.

### Push Notifications
1. User clicks "Enable Push" in Profile → browser permission prompt
2. Frontend calls `registration.pushManager.subscribe()` with VAPID public key from `NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY`
3. Subscription payload sent to `POST /notifications/push/subscription`
4. Service worker handles incoming push events and `notificationclick` (focuses/opens app window)

---

## Critical Files

| File | Why It Matters |
|------|---------------|
| `src/lib/api/client.ts` | Axios instance + request interceptor (auth header) + response interceptor (token refresh) |
| `src/features/auth/store/auth-store.ts` | Single source of truth for auth state — Zustand store |
| `src/providers/auth-bootstrap.tsx` | Hydrates auth store from `localStorage` on app mount |
| `src/config/api-routes.ts` | **All** backend route definitions — change routes here only |
| `src/config/env.ts` | Env vars: `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY` |
| `src/config/storage-keys.ts` | All `localStorage`/cookie key strings — never hardcode these |
| `src/lib/api/token-storage.ts` | Token read/write/clear + manages session cookie |
| `src/app/(app)/layout.tsx` | **Server-side auth guard** — redirects to `/login` without cookie |
| `public/sw.js` | Service worker: caching strategy, push handler, notification click |
| `src/app/globals.css` | Design tokens (CSS vars), typography, layout utilities |
| `src/lib/utils/api-response.ts` | `unwrapApiResponse` — handles both `{ data: T }` envelope and raw `T` |

---

## Common Developer Workflows

### Add a new API call
1. Add route constant to `src/config/api-routes.ts`
2. Create/update the `<feature>/api/<feature>.api.ts` file
3. Add React Query hook in `<feature>/hooks/use-<feature>.ts`
4. Use hook in component — do **not** call `apiClient` directly in components

### Add a new page
1. Create route file in `src/app/(app)/` (authenticated) or `src/app/(public)/` (public)
2. Create the page component in the relevant `src/features/<domain>/components/` directory
3. If authenticated-only, the route group layout handles the guard automatically

### Add a new feature domain
Follow this structure:
```
src/features/<name>/
  api/<name>.api.ts
  components/<name>-page.tsx
  hooks/use-<name>.ts
  schemas/<name>.schema.ts   (if forms exist)
  store/<name>-store.ts      (if global state needed)
  types/<name>.types.ts
```

### Show a toast notification
```ts
import { toast } from "@/lib/toast/toast-store";
toast.success("Done!");
toast.error("Something failed.");
toast.info("FYI message.");
```

### Check if user is authenticated in a component
```ts
import { useAuth } from "@/features/auth/hooks/use-auth";
const { isAuthenticated, user, tokens } = useAuth();
```

### Change API base URL
Set `NEXT_PUBLIC_API_BASE_URL` in `.env.local`. Dev fallback is `http://localhost:8081/api`.

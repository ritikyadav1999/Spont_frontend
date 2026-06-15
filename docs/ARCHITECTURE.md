# ARCHITECTURE.md — Spont Frontend

---

## High-Level Architecture

```
Browser / PWA Client
┌─────────────────────────────────────────────────────────────────┐
│  Next.js 16 App (App Router, React 19)                          │
│                                                                  │
│  ┌──────────┐  ┌──────────────────────────────────────────────┐ │
│  │  Server  │  │  Client (hydrated from server RSC shell)      │ │
│  │  Layers  │  │                                               │ │
│  │          │  │  AppProviders                                 │ │
│  │ RootLayout│ │   ├─ QueryProvider (TanStack Query)          │ │
│  │ (app)/   │  │   ├─ AuthBootstrap (hydrate Zustand store)   │ │
│  │  layout  │  │   ├─ ServiceWorkerRegister (PWA)             │ │
│  │ (cookie  │  │   ├─ {children} (pages)                      │ │
│  │  guard)  │  │   ├─ InstallPrompt (PWA banner)              │ │
│  │          │  │   └─ ToastViewport (global toasts)           │ │
│  └──────────┘  └──────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
         │  HTTP (Axios)        │  Web Push (VAPID)
         ▼                      ▼
   ┌────────────┐         ┌─────────────┐
   │  Backend   │         │  Push Server│
   │  REST API  │         │  (external) │
   │  :8081/api │         └─────────────┘
   └────────────┘
```

---

## Route Group Structure

```
src/app/
├── layout.tsx                  ← Root: metadata, viewport, AppProviders
├── page.tsx                    ← Redirects to /discover
├── login/page.tsx              ← Auth page (redirects to /discover if session exists)
├── register/page.tsx           ← Auth page (redirects to /discover if session exists)
├── offline/page.tsx            ← PWA offline fallback
│
├── (app)/                      ← SERVER-GUARDED: checks `spont.session` cookie
│   ├── layout.tsx              ← Redirect to /login if no cookie; wraps with AppShell
│   ├── events/[token]/edit/    ← Host-only edit page
│   ├── host/                   ← Create event
│   ├── my-events/              ← My Pulse dashboard
│   ├── notifications/          ← Notification inbox
│   └── profile/                ← Own profile
│
└── (public)/                   ← No auth guard; uses PublicBrowseShell with sidebar
    ├── discover/               ← Event feed (accessible without login)
    ├── events/[token]/         ← Event detail (accessible without login)
    ├── profile/[userId]/       ← Public profile view
    └── contact-feedback/       ← Contact/feedback form
```

---

## Data Flow

### Authentication Bootstrap (on every page load)

```
SSR (Server)                     CSR (Client)
─────────────                    ────────────
Read cookie:                     AuthBootstrap.useEffect()
spont.session=1?                   └─ hydrateFromStorage()
  Yes → render (app)/layout            └─ read localStorage tokens
  No  → redirect(/login)              └─ read localStorage user
                                       └─ setAuthenticated(user, tokens)
                                            └─ Zustand store updated
```

### API Request Flow

```
Component/Hook
  └─ TanStack Query (useQuery / useMutation)
       └─ Feature API function (e.g., eventsApi.list())
            └─ apiClient.get(url)   [Axios instance]
                 ├─ REQUEST interceptor: attach Bearer token from localStorage
                 └─ RESPONSE interceptor:
                      ├─ Success (2xx) → pass through
                      └─ 401 → token refresh flow:
                           ├─ POST /auth/refresh (withCredentials)
                           ├─ Update token in localStorage
                           └─ Retry original request with new token
                                (concurrent 401s queued, resolved together)
```

### API Response Normalization

```
Raw Backend Response
  └─ May be: { data: T, message, success } OR raw T directly
       └─ unwrapApiResponse(payload) → always returns T
            └─ Component gets clean, typed data
```

---

## Component Interaction Map

```
AppSidebar
  ├─ useAuth()                   → reads Zustand auth store
  ├─ useUnreadNotificationsCount() → polls /notifications every 60s
  └─ useLogout()                 → clears tokens + redirects

AppShell (authenticated layout wrapper)
  ├─ useAuth()                   → client-side auth check (secondary to server guard)
  ├─ useUnreadNotificationsCount()
  └─ AppSidebar

PublicBrowseShell (public layout wrapper)
  ├─ AppSidebar (with mobile support)
  └─ Sidebar collapse state persisted to localStorage

EventDetailsPage
  ├─ useEventByToken(token)      → GET /event/:token
  ├─ useApprovedParticipants(token)
  ├─ usePendingParticipants(token)
  ├─ useRequestJoinEvent(token)  → POST /event/request-join/:token
  ├─ useParticipantDecision(token) → PUT /event/:token/participant/:id/:decision
  └─ useAuth()                   → derive isHostView, isCoHostView, isApprovedParticipant

ProfilePage
  ├─ useAuth()                   → own profile data
  ├─ usePublicProfile(userId?)   → GET /user/:userId (public view)
  ├─ useMyPastEvents()           → GET /event/my-events/past (infinite scroll)
  └─ PushNotificationSettingsCard (own profile only)

PushNotificationSettingsCard
  └─ usePushNotifications()
       ├─ pushNotificationsApi.subscribe() → POST /notifications/push/subscription
       └─ pushNotificationsApi.unsubscribe() → DELETE /notifications/push/subscription

HostEventPage (create/edit)
  ├─ useCreateEvent()            → POST /event/create
  ├─ useUpdateEvent(token)       → PUT /event/:token/edit
  └─ External: Nominatim API (openstreetmap.org) for location search
```

---

## External Integrations

### 1. Backend REST API
- **Base URL**: `NEXT_PUBLIC_API_BASE_URL` (dev default: `http://localhost:8081/api`)
- **Auth**: JWT Bearer tokens + httpOnly-style cookie refresh
- **Response envelope**: `{ data: T, message?: string, success?: boolean }` OR raw `T`
- **Error envelope**: `{ message?: string, error?: string, statusCode?: number }`

### 2. Nominatim (OpenStreetMap) — Location Search
- **Endpoint**: `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=...`
- **Used in**: `HostEventPage` — when user searches for event location
- **Output**: array of `{ display_name, lat, lon }` → mapped to `LocationSearchResult`
- **No API key required** (free, but rate-limited)

### 3. OpenStreetMap Embed — Map Preview
- **Endpoint**: `https://www.openstreetmap.org/export/embed.html`
- **Used in**: `HostEventPage` (preview while creating) and `EventDetailsPage` (location display)
- **Rendered via**: `<iframe>` with `grayscale` CSS filter for design consistency

### 4. Google Maps (External Link)
- **Used in**: `EventDetailsPage` — "Open in Google Maps" button
- **Pattern**: `https://www.google.com/maps/search/?api=1&query={lat},{lon}`
- Opens in new tab

### 5. Web Push (VAPID)
- **VAPID public key**: `NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY` env var
- **Subscription flow**: browser `PushManager.subscribe()` → sends endpoint/keys to backend
- **Push receipt**: handled entirely in `public/sw.js` service worker

### 6. PWA Service Worker (`public/sw.js`)
- **Cache strategy**: Network-first for navigation, Stale-While-Revalidate for assets
- **Cache names**: `spont-pwa-v1-app-shell`, `spont-pwa-v1-pages`, `spont-pwa-v1-assets`
- **Offline fallback**: serves cached `/offline` page

---

## State Management

| State Type | Tool | Scope |
|-----------|------|-------|
| Auth (user, tokens, status) | Zustand (`useAuthStore`) | Global, persisted via localStorage |
| Server data (events, profiles, notifications) | TanStack Query | Component tree, auto-invalidated |
| Toast notifications | Zustand (`useToastStore`) + `toast` singleton | Global |
| Form state | React Hook Form | Local component |
| UI state (sidebar collapsed, modal open) | `useState` / `localStorage` | Local component |

---

## Security Notes

- Access token stored in `localStorage` — **not** `httpOnly` (XSS risk; acceptable for MVP)
- Refresh token sent via `withCredentials` — relies on backend setting `httpOnly` cookie
- Server-side auth guard is a **UX guard** (cookie check), not a true security boundary — backend enforces actual auth
- JWT subject decoded client-side for host check — no signature verification (trusts own token)
- Push subscription endpoint/keys sent to backend over HTTPS

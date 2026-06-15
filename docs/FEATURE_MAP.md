# FEATURE_MAP.md — Spont Frontend

> Every major feature, where it lives, and what it touches.

---

## Feature Index

| # | Feature | Route(s) | Status |
|---|---------|----------|--------|
| 1 | Authentication | `/login`, `/register` | ✅ Full |
| 2 | Discover Feed | `/discover` | ✅ Full |
| 3 | Event Detail | `/events/[token]` | ✅ Full |
| 4 | Host Event | `/host` | ✅ Full |
| 5 | Edit Event | `/events/[token]/edit` | ✅ Full |
| 6 | My Events (My Pulse) | `/my-events` | ✅ Full |
| 7 | Notifications | `/notifications` | ✅ Full |
| 8 | Web Push | `/profile` (settings card) | ✅ Full |
| 9 | Profile (Own) | `/profile` | ✅ Full |
| 10 | Profile (Public) | `/profile/[userId]` | ✅ Full |
| 11 | Contact & Feedback | `/contact-feedback` | ✅ Full |
| 12 | PWA / Offline | `/offline` | ✅ Full |
| 13 | Cover Photo Upload | `/host` (UI only) | ⚠️ UI Ready, Backend Pending |
| 14 | Social Login | `/login`, `/register` (buttons) | ⚠️ UI Only, Not Wired |
| 15 | Forgot Password | `/login` (button) | ⚠️ UI Only, Not Wired |

---

## 1. Authentication

**Purpose**: Register, log in, and log out users. Maintain session state across the app.

### Responsible Files

| File | Role |
|------|------|
| `src/app/login/page.tsx` | Route entry — server checks cookie, redirects if already logged in |
| `src/app/register/page.tsx` | Route entry — same guard |
| `src/features/auth/components/login-screen.tsx` | Login form UI (email/phone + password, show/hide password) |
| `src/features/auth/components/register-screen.tsx` | 2-step registration form (Step 1: name/email/password/gender, Step 2: phone) |
| `src/features/auth/components/auth-shell.tsx` | Shared layout wrapper for both auth screens (gradient bg, brand) |
| `src/features/auth/api/auth.api.ts` | `login()`, `register()`, `logout()` API calls; normalizes login response |
| `src/features/auth/hooks/use-auth.ts` | `useAuth()`, `useLogin()`, `useRegister()`, `useLogout()` hooks |
| `src/features/auth/store/auth-store.ts` | Zustand store: `status`, `user`, `tokens`, `setAuthenticated()`, `hydrateFromStorage()` |
| `src/features/auth/schemas/login.schema.ts` | Zod: `identifier` (min 3), `password` (min 6) |
| `src/features/auth/schemas/register.schema.ts` | Zod: name, email, password, gender enum, phone regex |
| `src/features/auth/types/auth.types.ts` | `AuthUser`, `AuthTokens`, `LoginPayload`, `RegisterPayload`, `LoginResponse` |
| `src/lib/api/token-storage.ts` | Read/write/clear access token from localStorage + set/clear session cookie |
| `src/lib/api/user-storage.ts` | Read/write/clear serialized user from localStorage |
| `src/lib/auth/session-cookie.ts` | Set/clear `spont.session=1` document cookie (1-year expiry, SameSite=Lax) |
| `src/providers/auth-bootstrap.tsx` | On mount: reads storage → hydrates Zustand store |
| `src/app/(app)/layout.tsx` | Server-side auth guard: reads cookie, redirects to /login |

### Dependencies
- `react-hook-form` + `@hookform/resolvers` + `zod` — form validation
- `@tanstack/react-query` — mutation state
- `zustand` — global auth state
- `next/navigation` — `useRouter`, `redirect`
- `axios` via `apiClient`

---

## 2. Discover Feed

**Purpose**: Browse all public events. Search (UI only). Filter Local/Global (UI only).

### Responsible Files

| File | Role |
|------|------|
| `src/app/(public)/discover/page.tsx` | Route entry |
| `src/features/events/components/discover-page.tsx` | Full page: search bar, event grid, EventCard component |
| `src/features/events/api/events.api.ts` | `eventsApi.list()` → `GET /event` |
| `src/features/events/hooks/use-events.ts` | `useEvents()` |
| `src/features/events/types/event.types.ts` | `EventItem`, `EventListResponse`, pagination types |

### Dependencies
- `@tanstack/react-query` — data fetching
- `lucide-react` — icons
- OpenStreetMap data indirectly (coordinates used for distance calculation)

### Notable Logic
- **Category detection**: keyword-based title scan (TECH, WELLNESS, NIGHTLIFE → Music fallback)
- **Distance**: derived from `Math.abs(lat - lon) % 6 + 0.8` — placeholder, not real GPS distance
- **Going count / attendee count**: derived from `maxParticipants` — not from real participation data
- **Urgency tags**: "Starting Soon" if < 8h away, "Almost Full" if >82% capacity estimate

---

## 3. Event Detail

**Purpose**: View full event info, join/request to join, manage participants (host/co-host), share.

### Responsible Files

| File | Role |
|------|------|
| `src/app/(public)/events/[token]/page.tsx` | Route entry (public — no auth required to view) |
| `src/features/events/components/event-details-page.tsx` | Full page with all participant management logic |
| `src/features/events/api/events.api.ts` | `byToken()`, `approvedParticipants()`, `pendingParticipants()`, `requestJoin()`, `participantDecision()` |
| `src/features/events/hooks/use-events.ts` | `useEventByToken()`, `useApprovedParticipants()`, `usePendingParticipants()`, `useRequestJoinEvent()`, `useParticipantDecision()` |

### Dependencies
- OpenStreetMap `<iframe>` embed for location map
- Google Maps external link
- `useAuth()` — determines user role (host/co-host/member/guest)
- JWT decode — identifies current user without extra API call

### Notable Logic
- **Role detection**: compares current user ID against participant list and event creator ID
- **JWT decode**: base64url decode of JWT payload to extract `sub` (user ID) — no library used
- **Join eligibility**: user must have `name + gender + phone` populated in their auth user object
- **Share**: native `navigator.share()` with clipboard fallback
- **Participant decision values**: `"approved"`, `"co_host"`, `"REJECTED"` (note mixed casing — matches backend)

---

## 4. Host Event (Create)

**Purpose**: Create a new event with title, description, schedule, location, capacity, join mode, visibility.

### Responsible Files

| File | Role |
|------|------|
| `src/app/(app)/host/page.tsx` | Route entry (auth-gated) |
| `src/features/host/components/host-event-page.tsx` | Full form: essentials, visuals (UI only), logistics (time + location + capacity + settings) |
| `src/features/host/api/host-event.api.ts` | `create()` → `POST /event/create` |
| `src/features/host/hooks/use-host-event.ts` | `useCreateEvent()`, `useUpdateEvent()` |
| `src/features/host/schemas/host-event.schema.ts` | Zod schema with cross-field refinement (end > start) |
| `src/features/host/types/host-event.types.ts` | `CreateEventPayload`, `LocationSearchResult`, status/joinMode/visibility enums |

### Dependencies
- **Nominatim API** (external): `https://nominatim.openstreetmap.org/search` — free geocoding
- OpenStreetMap `<iframe>` embed for real-time map preview
- `react-hook-form` + zod

### Notable Logic
- Location search is async button-triggered (not debounced on input)
- Latitude/longitude stored as hidden form values after selection
- Capacity slider + stepper control (clamped 1–2000)
- Dates converted to ISO 8601 on submit: `new Date(\`${date}T${time}\`).toISOString()`
- Cover photo: file input UI exists but file is **not sent to backend** (pending backend support)

---

## 5. Edit Event

**Purpose**: Update an existing event. Only accessible to the host.

### Responsible Files

| File | Role |
|------|------|
| `src/app/(app)/events/[token]/edit/page.tsx` | Route entry (auth-gated) |
| `src/features/host/components/edit-event-page.tsx` | Wrapper: fetches event, verifies host ownership, renders `HostEventPage` in edit mode |
| `src/features/host/components/host-event-page.tsx` | Shared with create — `mode="edit"` prop changes submit label and API call |
| `src/features/host/api/host-event.api.ts` | `update(token, payload)` → `PUT /event/:token/edit` |

### Notable Logic
- Host check: decodes JWT `sub` and compares with `event.creator.userId`
- Form pre-fills from existing event data via `reset()` in a `useEffect`
- Date/time values are parsed from ISO strings back to `YYYY-MM-DD` / `HH:MM` for input fields

---

## 6. My Events (My Pulse)

**Purpose**: Dashboard of user's hosted events, attending events, and past events.

### Responsible Files

| File | Role |
|------|------|
| `src/app/(app)/my-events/page.tsx` | Route entry (auth-gated) |
| `src/features/my-events/components/my-events-page.tsx` | Full page: hosting section, attending section, memory lane |
| `src/features/my-events/components/event-poster-card.tsx` | Reusable card: image placeholder, badge, attendee stack, footer |
| `src/features/events/api/events.api.ts` | `myHostingEvents()`, `myAttendingEvents()`, `myPastEvents()` |
| `src/features/events/hooks/use-events.ts` | `useMyHostingEvents()`, `useMyAttendingEvents()`, `useMyPastEvents()` (infinite) |

### Notable Logic
- Hosting/Attending: horizontal scroll carousels with `useRef` scroll control
- Memory Lane (past events): infinite scroll via `useInfiniteQuery`, paginated
- Co-host modal: opens a drawer showing approved co-hosts for any event card
- Attendee avatar stack: uses deterministic gradient colors from event ID

---

## 7. Notifications

**Purpose**: View and mark read in-app notifications, grouped by recency.

### Responsible Files

| File | Role |
|------|------|
| `src/app/(app)/notifications/page.tsx` | Route entry (auth-gated) |
| `src/features/notifications/components/notifications-page.tsx` | Full page with grouped sections (Today, Yesterday, Last Week, Earlier) |
| `src/features/notifications/api/notifications.api.ts` | `list()` → `GET /notifications`, `markRead(id)` → `POST /notifications/:id/read`; normalizes raw backend shapes |
| `src/features/notifications/hooks/use-notifications.ts` | `useNotifications()` (60s poll), `useMarkNotificationRead()`, `useUnreadNotificationsCount()` |
| `src/features/notifications/types/notification.types.ts` | `NotificationItem` interface |

### Dependencies
- `lucide-react` — icons (per notification type heuristic from title/message text)
- `useRouter` — navigate to event when notification has `eventToken`

### Notable Logic
- **Normalization**: backend may send `id` or `notificationId`, `message` or `content` or `body`, etc. — all handled in `normalizeNotification()`
- **Categorization**: date-based bucketing (`today`, `yesterday`, `last-week`, `earlier`)
- **Icon selection**: heuristic keyword match on title+message string

---

## 8. Web Push Notifications

**Purpose**: Subscribe/unsubscribe device to browser push notifications.

### Responsible Files

| File | Role |
|------|------|
| `src/features/notifications/components/push-notification-settings-card.tsx` | UI card in Profile page |
| `src/features/notifications/hooks/use-push-notifications.ts` | Full push lifecycle: permission, subscription, enable/disable |
| `src/features/notifications/api/push-notifications.api.ts` | `subscribe()` → `POST /notifications/push/subscription`, `unsubscribe()` → `DELETE /notifications/push/subscription` |
| `src/features/notifications/lib/push-notifications.ts` | VAPID key conversion, subscription payload serialization |
| `src/features/notifications/types/push-notification.types.ts` | `PushSubscriptionPayload`, `PushNotificationPreferences` |
| `public/sw.js` | Service worker: `push` event handler (show notification), `notificationclick` (focus/open app) |

### Dependencies
- `NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY` env var (base64url-encoded VAPID public key)
- Browser `Notification` API, `PushManager`, `ServiceWorkerRegistration`

---

## 9 & 10. Profile (Own + Public)

**Purpose**: Display user identity and past event archive. Own profile includes push notification settings.

### Responsible Files

| File | Role |
|------|------|
| `src/app/(app)/profile/page.tsx` | Own profile route (auth-gated) |
| `src/app/(public)/profile/[userId]/page.tsx` | Public profile route |
| `src/features/profile/components/profile-page.tsx` | Shared component — `userId` prop determines own vs. public mode |
| `src/features/profile/components/experience-card.tsx` | Standard past event card |
| `src/features/profile/components/experience-feature-card.tsx` | Wide featured past event card (every 4th event) |
| `src/features/profile/components/profile-stat.tsx` | Stat value + label display |
| `src/features/profile/api/profile.api.ts` | `byId(userId)` → `GET /user/:userId`; normalizes user data |
| `src/features/profile/hooks/use-profile.ts` | `usePublicProfile(userId)` |
| `src/features/profile/types/public-profile.types.ts` | `PublicProfile` |
| `src/features/profile/types/profile.types.ts` | `ProfileExperience`, `ProfileStat` |

### Notable Logic
- Own profile: data from Zustand auth store (no additional API call)
- Public profile: API call to `/user/:userId`
- Past experiences: from infinite query `useMyPastEvents()` — only shown on own profile
- Every 4th experience (`index === 3`) renders as `ExperienceFeatureCard` (2-col wide)
- Public event history explicitly blocked ("not available yet")

---

## 11. Contact & Feedback

**Purpose**: Let users send feedback, bug reports, feature requests, or general queries.

### Responsible Files

| File | Role |
|------|------|
| `src/app/(public)/contact-feedback/page.tsx` | Route entry (public) |
| `src/features/contact-feedback/components/contact-feedback-page.tsx` | Full page UI |
| `src/features/feedback/api/feedback.api.ts` | `submit()` → `POST /feedback/submit` |
| `src/features/feedback/hooks/use-feedback.ts` | `useSubmitFeedback()` |

### Inquiry Types
`FEEDBACK` | `BUG_REPORT` | `REQUEST_FEATURE` | `REPORT_USER` | `GENERAL_QUERY`

---

## 12. PWA / Offline Support

**Purpose**: Installable app experience with offline fallback.

### Responsible Files

| File | Role |
|------|------|
| `src/app/manifest.ts` | Web App Manifest (name, icons, start_url, display: standalone) |
| `public/sw.js` | Service worker (caching, push, notification click) |
| `src/components/pwa/service-worker-register.tsx` | Registers SW in production only; toasts on update available |
| `src/components/pwa/install-prompt.tsx` | Intercepts `beforeinstallprompt`, shows install banner (dismissable, persisted) |
| `src/app/offline/page.tsx` | Offline fallback page served from cache |
| `src/app/icon.tsx` | Dynamic icon (512×512, `next/og` ImageResponse) |
| `src/app/icon-maskable.tsx` | Maskable icon (512×512) |
| `src/app/apple-icon.tsx` | Apple touch icon (180×180) |

---

## Cross-Cutting Concerns

### Toast System
- `src/lib/toast/toast-store.ts` — Zustand store + `toast.success/error/info()` singleton
- `src/components/ui/toast-viewport.tsx` — renders toasts, auto-dismisses after 3.2s
- Used everywhere: auth hooks, push hooks, host form

### Design System
- `src/app/globals.css` — CSS custom properties (colors, fonts), utility classes
- Key classes: `ui-page-shell`, `ui-page-shell--narrow`, `kinetic-gradient`, `glass-panel`
- Fonts: **Inter** (body), **Plus Jakarta Sans** (headlines via `font-headline` class)
- `src/lib/utils/cn.ts` — `clsx` + `tailwind-merge` utility

### API Response Handling
- `src/lib/utils/api-response.ts` — `unwrapApiResponse()`, `getApiErrorMessage()`
- Every API function normalizes its response before returning — components receive typed data

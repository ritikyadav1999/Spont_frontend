# API_MAP.md — Spont Frontend

> All backend API routes consumed by the frontend. Defined in `src/config/api-routes.ts`.

**Base URL**: `NEXT_PUBLIC_API_BASE_URL` (dev: `http://localhost:8081/api`)
**Auth**: All protected routes require `Authorization: Bearer <accessToken>` header (injected by Axios interceptor)

---

## Auth Routes

### POST /auth/login
**Purpose**: Authenticate user, receive access token.

**Input**:
```json
{
  "identifier": "string",  // email or phone
  "password": "string"
}
```

**Expected Output** (normalized by `normalizeLoginResponse`):
```json
{
  "token": "string",       // JWT access token (field name on raw response)
  "name": "string",
  "email": "string",
  "phone": "string",
  "gender": "MALE | FEMALE",
  "userId": "string"
}
```
Or wrapped: `{ "data": { ...above } }`

**Frontend Result**: `LoginResponse = { accessToken: string, user: AuthUser }`

**Related Services**: `authApi.login()` → `useLogin()` → `login-screen.tsx`

**Side Effects**: Saves token to localStorage, saves user to localStorage, sets session cookie

---

### POST /auth/register
**Purpose**: Create a new user account.

**Input**:
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "gender": "MALE | FEMALE",
  "phone": "string"       // 10-15 digits, optional leading +
}
```

**Expected Output**: `ApiEnvelope<unknown>` (success message, no token)

**Related Services**: `authApi.register()` → `useRegister()` → `register-screen.tsx`

**Side Effects**: Redirects to `/login?registered=1` on success

---

### POST /auth/refresh
**Purpose**: Obtain a new access token using an httpOnly refresh cookie.

**Input**: None (refresh token in cookie via `withCredentials: true`)

**Expected Output**:
```
string (raw new accessToken)
```
Or wrapped: `{ "data": "string" }`

**Related Services**: `apiClient` response interceptor (automatic, never called directly)

**Note**: Called silently on every 401 response. If this fails, tokens are cleared.

---

### POST /auth/logout
**Purpose**: Invalidate the current session server-side.

**Input**: None

**Expected Output**: `string | ApiEnvelope<string>` (message)

**Related Services**: `authApi.logout()` → `useLogout()` → `AppSidebar`

**Side Effects**: Clears localStorage tokens and session cookie, redirects to `/login`

---

## Event Routes

### GET /event
**Purpose**: List all public events (discover feed).

**Input**: None

**Expected Output**:
```json
{
  "content": [EventItem],
  "totalElements": 42,
  "totalPages": 5,
  "number": 0,
  "last": false,
  ...pageable fields
}
```

**Related Services**: `eventsApi.list()` → `useEvents()` → `discover-page.tsx`

---

### GET /event/:token
**Purpose**: Get details of a specific event by its invite token.

**Input**: `token` (URL param)

**Expected Output**: `EventItem | ApiEnvelope<EventItem>`

```json
{
  "eventId": "string",
  "inviteToken": "string",
  "title": "string",
  "description": "string",
  "startTime": "ISO8601",
  "endTime": "ISO8601",
  "locationName": "string",
  "latitude": 0.0,
  "longitude": 0.0,
  "status": "SCHEDULED | ONGOING | CANCELLED | COMPLETED",
  "joinMode": "OPEN | APPROVAL_REQUIRED",
  "visibility": "PUBLIC | PRIVATE",
  "maxParticipants": 0,
  "creator": { "userId": "string", "name": "string" }
}
```

**Related Services**: `eventsApi.byToken(token)` → `useEventByToken(token)` → `event-details-page.tsx`, `edit-event-page.tsx`

---

### POST /event/create
**Purpose**: Create a new event. Requires authentication.

**Input**:
```json
{
  "title": "string",
  "description": "string",
  "startTime": "ISO8601",
  "endTime": "ISO8601",
  "locationName": "string",
  "latitude": 0.0,
  "longitude": 0.0,
  "status": "SCHEDULED | ONGOING | CANCELLED | COMPLETED",
  "joinMode": "OPEN | APPROVAL_REQUIRED",
  "visibility": "PUBLIC | PRIVATE",
  "maxParticipants": 0
}
```

**Expected Output**: `ApiEnvelope<unknown> | unknown`

**Related Services**: `hostEventApi.create()` → `useCreateEvent()` → `host-event-page.tsx`

---

### PUT /event/:token/edit
**Purpose**: Update an existing event. Requires authentication + host role.

**Input**: Same shape as create payload.

**Expected Output**: `ApiEnvelope<string> | string`

**Related Services**: `hostEventApi.update(token, payload)` → `useUpdateEvent(token)` → `host-event-page.tsx`

---

### GET /event/my-events/hosting
**Purpose**: List events the authenticated user is hosting.

**Input**: Query param `page` (number, default 0)

**Expected Output**: `EventListResponse | ApiEnvelope<EventListResponse>`

**Related Services**: `eventsApi.myHostingEvents(page)` → `useMyHostingEvents(page)` → `my-events-page.tsx`

---

### GET /event/my-events/attending
**Purpose**: List events the authenticated user is attending.

**Input**: Query param `page` (number, default 0)

**Expected Output**: `EventListResponse | ApiEnvelope<EventListResponse>`

**Related Services**: `eventsApi.myAttendingEvents(page)` → `useMyAttendingEvents(page)` → `my-events-page.tsx`

---

### GET /event/my-events/past
**Purpose**: List past events for the authenticated user (paginated).

**Input**: Query param `page` (number, default 0)

**Expected Output** (normalized by `normalizePaginatedData`):
```json
{
  "data": [PastEventSummary],    // or content/items/array
  "hasNext": false,
  "page": 0
}
```

`PastEventSummary`:
```json
{
  "inviteToken": "string",
  "title": "string",
  "location": "string",
  "startTime": "ISO8601"
}
```

**Related Services**: `eventsApi.myPastEvents(page)` → `useMyPastEvents()` (infinite query) → `my-events-page.tsx`, `profile-page.tsx`

---

### POST /event/request-join/:token
**Purpose**: Request to join an event. For OPEN events, immediately approved. For APPROVAL_REQUIRED, goes to pending.

**Input**:
```json
{
  "name": "string",
  "gender": "MALE | FEMALE",
  "phone": "string"
}
```

**Expected Output**: `JoinEventResponse | ApiEnvelope<JoinEventResponse>`
```json
{
  "token": "string",
  "role": "string"
}
```

**Related Services**: `eventsApi.requestJoin(token, payload)` → `useRequestJoinEvent(token)` → `event-details-page.tsx`

---

### GET /event/:token/participants/approved
**Purpose**: Get list of approved participants for an event.

**Input**: `token` (URL param)

**Expected Output**: `EventParticipant[] | ApiEnvelope<EventParticipant[]>`

```json
[{
  "participantId": "string",   // or userId or id
  "userId": "string",
  "name": "string",
  "role": "HOST | CO_HOST | COHOST | MEMBER",
  "joinedAt": "ISO8601 | null"
}]
```

**Note**: Field names are normalized client-side — backend may return `participantId`, `userId`, or `id`.

**Related Services**: `eventsApi.approvedParticipants(token)` → `useApprovedParticipants(token)` → `event-details-page.tsx`, `my-events-page.tsx`

---

### GET /event/:token/participants/pending
**Purpose**: Get list of pending (awaiting approval) participants.

**Input**: `token` (URL param)

**Expected Output**: Same shape as approved participants.

**Related Services**: `eventsApi.pendingParticipants(token)` → `usePendingParticipants(token)` → `event-details-page.tsx`

---

### PUT /event/:token/participant/:participantId/:decision
**Purpose**: Host/co-host approves, rejects, or promotes a participant.

**Input**: All values in URL path.

`decision` values:
- `"approved"` — approve pending participant
- `"co_host"` — promote to co-host
- `"REJECTED"` — reject or remove

**Expected Output**: `ApiEnvelope<unknown> | unknown`

**Related Services**: `eventsApi.participantDecision(token, participantId, decision)` → `useParticipantDecision(token)` → `event-details-page.tsx`

**Side Effects**: Optimistically updates React Query cache (removes participant from list immediately), then invalidates

---

## Notification Routes

### GET /notifications
**Purpose**: List all notifications for the authenticated user.

**Input**: None

**Expected Output** (heavily normalized — backend shape may vary):
```
RawNotification[] | { content: [], notifications: [], items: [], data: [] }
```
Normalized to `NotificationItem[]`:
```json
[{
  "id": "string",
  "title": "string",
  "message": "string",
  "createdAt": "ISO8601 | null",
  "read": false,
  "eventToken": "string | undefined",
  "actorName": "string | undefined",
  "category": "today | yesterday | last-week | earlier"
}]
```

**Related Services**: `notificationsApi.list()` → `useNotifications()` (polls every 60s) → `notifications-page.tsx`, `AppShell`, `AppSidebar`

---

### POST /notifications/:id/read
**Purpose**: Mark a specific notification as read.

**Input**: `id` (URL param)

**Expected Output**: `ApiEnvelope<unknown> | unknown`

**Related Services**: `notificationsApi.markRead(id)` → `useMarkNotificationRead()` → `notifications-page.tsx`

**Side Effects**: Invalidates notifications list query

---

### POST /notifications/push/subscription
**Purpose**: Register a browser push subscription with the backend.

**Input**:
```json
{
  "endpoint": "string",
  "expirationTime": "number | null",
  "keys": {
    "p256dh": "string (base64)",
    "auth": "string (base64)"
  }
}
```

**Expected Output**: `ApiEnvelope<unknown> | unknown`

**Related Services**: `pushNotificationsApi.subscribe(payload)` → `usePushNotifications().enablePush()` → `push-notification-settings-card.tsx`

---

### DELETE /notifications/push/subscription
**Purpose**: Unregister a push subscription.

**Input** (request body):
```json
{
  "endpoint": "string"
}
```

**Expected Output**: `ApiEnvelope<unknown> | unknown`

**Related Services**: `pushNotificationsApi.unsubscribe(endpoint)` → `usePushNotifications().disablePush()`

---

## User Routes

### GET /user/:userId
**Purpose**: Get public profile data for any user.

**Input**: `userId` (URL param)

**Expected Output** (normalized):
```json
{
  "userId": "string",   // or id
  "name": "string",     // or fullName
  "bio": "string",      // or about/description
  "phone": "string",
  "email": "string",
  "gender": "MALE | FEMALE"
}
```

**Related Services**: `profileApi.byId(userId)` → `usePublicProfile(userId)` → `profile-page.tsx`

---

## Feedback Routes

### POST /feedback/submit
**Purpose**: Submit a contact/feedback message (public endpoint, no auth required).

**Input**:
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "inquiryType": "FEEDBACK | BUG_REPORT | REQUEST_FEATURE | REPORT_USER | GENERAL_QUERY",
  "message": "string"
}
```

**Expected Output**:
```json
{
  "data": null,
  "message": "string",
  "success": true
}
```
Frontend returns `response.data.message` as the success string.

**Related Services**: `feedbackApi.submit(payload)` → `useSubmitFeedback()` → `contact-feedback-page.tsx`

---

## External APIs (Not Backend)

### Nominatim (OpenStreetMap) — Location Search
**URL**: `GET https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q={query}`

**Called from**: `host-event-page.tsx` (directly with `fetch`, not via `apiClient`)

**Response shape**:
```json
[{
  "display_name": "string",
  "lat": "string",
  "lon": "string"
}]
```

**Frontend result**: `LocationSearchResult[] = [{ displayName, latitude, longitude }]`

---

## Response Envelope Contract

The frontend handles **both** envelope and raw response patterns:

```typescript
// ApiEnvelope<T>
{ data: T, message?: string, success?: boolean }

// Raw T (some endpoints return data directly)
T

// ApiErrorEnvelope
{ message?: string, error?: string, statusCode?: number }
```

`unwrapApiResponse(payload)` in `src/lib/utils/api-response.ts` handles both:
```typescript
if (payload && typeof payload === "object" && "data" in payload) {
  return payload.data;  // envelope
}
return payload;         // raw
```

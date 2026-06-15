# NEW_DEVELOPER_GUIDE.md — Spont Frontend

> **Goal**: Understand this codebase in 15 minutes. Read top to bottom.

---

## What Is This?

**Spont** is a social event discovery PWA. Users browse, join, and host spontaneous local events. Think "find what's happening near you right now."

**Stack**: Next.js 16 (App Router) · React 19 · TypeScript · TanStack Query · Zustand · Axios · React Hook Form + Zod · Tailwind CSS v4 · PWA (Service Worker + Web Push)

---

## 1. Run It Locally (2 minutes)

```bash
# Install dependencies
npm install

# Create env file
cp .env.example .env.local
# → Set NEXT_PUBLIC_API_BASE_URL=http://localhost:8081/api
# → Set NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY=<your-vapid-public-key> (optional)

# Start dev server
npm run dev
# → App at http://localhost:3000
# → Default redirects to /discover
```

> ⚠️ **Important**: This project uses a very recent version of Next.js that may have API changes from your training data. Before writing any Next.js-specific code (layouts, routes, metadata), check `node_modules/next/dist/docs/` for the actual API.

---

## 2. Folder Structure (3 minutes)

```
src/
├── app/                    ← Next.js routes (App Router)
│   ├── (app)/              ← AUTH-REQUIRED routes (server cookie guard)
│   │   ├── layout.tsx      ← Reads cookie → redirect to /login if missing
│   │   ├── host/           ← Create event
│   │   ├── my-events/      ← My Pulse dashboard
│   │   ├── notifications/  ← Notification inbox
│   │   ├── profile/        ← Own profile
│   │   └── events/[token]/edit/  ← Edit event
│   ├── (public)/           ← NO auth guard (but same sidebar)
│   │   ├── discover/       ← Event feed (works without login)
│   │   ├── events/[token]/ ← Event detail
│   │   ├── profile/[userId]/ ← Public profile
│   │   └── contact-feedback/ ← Feedback form
│   ├── login/              ← Login page
│   ├── register/           ← Register page
│   ├── offline/            ← PWA offline fallback
│   └── layout.tsx          ← Root: metadata + AppProviders wrapper
│
├── features/               ← 🔑 Main business logic — organized by domain
│   ├── auth/               ← Login, register, logout, Zustand auth store
│   ├── events/             ← Discover feed, event detail, participant management
│   ├── host/               ← Create/edit event form
│   ├── my-events/          ← My Pulse page
│   ├── notifications/      ← In-app + push notifications
│   ├── profile/            ← Own + public profiles
│   ├── feedback/           ← Feedback API
│   └── contact-feedback/   ← Contact page component
│
├── lib/
│   ├── api/
│   │   ├── client.ts       ← 🔑 Axios instance + auth header + token refresh
│   │   ├── token-storage.ts ← Read/write JWT from localStorage
│   │   └── user-storage.ts  ← Read/write AuthUser from localStorage
│   ├── auth/
│   │   └── session-cookie.ts ← Set/clear session indicator cookie
│   ├── toast/
│   │   └── toast-store.ts  ← Global toast system (Zustand)
│   └── utils/
│       ├── api-response.ts ← unwrapApiResponse + getApiErrorMessage
│       └── cn.ts           ← clsx + tailwind-merge utility
│
├── config/
│   ├── api-routes.ts       ← 🔑 All backend API route strings
│   ├── env.ts              ← Typed env vars
│   └── storage-keys.ts     ← localStorage/cookie key constants
│
├── components/
│   ├── layout/
│   │   ├── app-shell.tsx         ← Auth-gated layout wrapper + sidebar
│   │   ├── app-sidebar.tsx       ← Navigation sidebar (animated brand, notification badge)
│   │   ├── app-page-header.tsx   ← Page title/description/actions header
│   │   └── public-browse-shell.tsx ← Public page layout wrapper
│   ├── pwa/
│   │   ├── install-prompt.tsx    ← PWA install banner
│   │   └── service-worker-register.tsx ← SW registration
│   └── ui/
│       └── toast-viewport.tsx    ← Toast notification renderer
│
├── providers/
│   ├── app-providers.tsx   ← Composes: QueryProvider + AuthBootstrap + SW + Toast
│   ├── auth-bootstrap.tsx  ← Hydrates auth store from localStorage on mount
│   └── query-provider.tsx  ← TanStack Query client setup
│
└── types/
    └── api.types.ts        ← ApiEnvelope<T>, ApiErrorEnvelope
```

---

## 3. Mental Models You Need (5 minutes)

### How auth works end-to-end

```
User logs in → backend returns JWT token
  → saved in localStorage as "spont.access_token"
  → user object saved in localStorage as "spont.auth_user"
  → "spont.session=1" cookie set on document (readable by Next.js server)

On every page load:
  → Server: (app)/layout.tsx reads cookie → no cookie = redirect to /login
  → Client: AuthBootstrap.useEffect() → reads localStorage → hydrates Zustand auth store

On every API request:
  → Axios interceptor reads token from localStorage → sets Authorization header

On 401 response:
  → Axios interceptor calls POST /auth/refresh (withCredentials)
  → Gets new token → stores it → retries original request
  → If refresh fails → clears everything
```

### How a new feature is typically built

```
1. Route: src/app/(app)/my-feature/page.tsx
2. Component: src/features/my-feature/components/my-feature-page.tsx
3. Hook: src/features/my-feature/hooks/use-my-feature.ts
4. API: src/features/my-feature/api/my-feature.api.ts
5. Types: src/features/my-feature/types/my-feature.types.ts
6. Route constant: src/config/api-routes.ts
```

### How data fetching works

```typescript
// In a hook file:
export const useMyData = () =>
  useQuery({
    queryKey: ["my-data"],
    queryFn: myApi.getData,
  });

// In a component:
const query = useMyData();
if (query.isLoading) return <Skeleton />;
if (query.isError) return <Error message={getApiErrorMessage(query.error)} />;
return <div>{query.data}</div>;
```

### The API response envelope problem

The backend sometimes returns `{ data: T, message, success }` and sometimes returns `T` directly. Always use `unwrapApiResponse()`:

```typescript
const response = await apiClient.get<ApiEnvelope<MyType> | MyType>(url);
const data = unwrapApiResponse(response.data); // always gets T
```

---

## 4. Key Files to Know First (3 minutes)

Open these files in order:

| # | File | What to learn |
|---|------|--------------|
| 1 | `src/config/api-routes.ts` | Every backend endpoint |
| 2 | `src/lib/api/client.ts` | How auth headers & token refresh work |
| 3 | `src/features/auth/store/auth-store.ts` | Global auth state shape |
| 4 | `src/providers/auth-bootstrap.tsx` | How auth state is hydrated |
| 5 | `src/lib/utils/api-response.ts` | The two helper functions used everywhere |
| 6 | `src/app/globals.css` | Design tokens and utility classes |
| 7 | `src/config/env.ts` | What env vars exist |

---

## 5. Common Tasks (2 minutes)

### Show a toast
```typescript
import { toast } from "@/lib/toast/toast-store";
toast.success("Event created!");
toast.error("Something went wrong.");
toast.info("Update available.");
```

### Get current user
```typescript
import { useAuth } from "@/features/auth/hooks/use-auth";
const { user, isAuthenticated, tokens } = useAuth();
```

### Add a new backend API call
```typescript
// 1. Add route constant in src/config/api-routes.ts:
export const API_ROUTES = {
  myFeature: {
    list: "/my-feature",
    byId: (id: string) => `/my-feature/${id}`,
  },
};

// 2. Create API function in src/features/my-feature/api/my-feature.api.ts:
export const myFeatureApi = {
  async list(): Promise<MyType[]> {
    const response = await apiClient.get<ApiEnvelope<MyType[]> | MyType[]>(
      API_ROUTES.myFeature.list
    );
    return unwrapApiResponse(response.data);
  },
};

// 3. Create hook in src/features/my-feature/hooks/use-my-feature.ts:
export const useMyFeature = () =>
  useQuery({
    queryKey: ["my-feature"],
    queryFn: myFeatureApi.list,
  });
```

### Add a form with validation
```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({ title: z.string().min(3) });
type Schema = z.infer<typeof schema>;

const { register, handleSubmit, formState: { errors } } = useForm<Schema>({
  resolver: zodResolver(schema),
});
```

### Use design system classes
```tsx
// Page wrapper
<div className="ui-page-shell ui-page-shell--narrow">

// Headline text
<h1 className="font-headline text-5xl font-bold tracking-tight text-on-surface">

// Card
<div className="rounded-[1.75rem] bg-surface-container p-6">

// Primary button
<button className="rounded-full bg-primary px-6 py-3 font-bold text-on-primary-container">

// Secondary button
<button className="rounded-full bg-surface-container-high px-6 py-3 text-on-surface">
```

---

## 6. Gotchas & Non-obvious Things

### ⚠️ Server cookie vs client Zustand — two auth systems
The server-side layout checks `spont.session=1` cookie. The client checks Zustand store. Both must be in sync. `tokenStorage.setTokens()` sets the cookie, `tokenStorage.clearTokens()` clears it.

### ⚠️ Backend response normalization
Backend field names are inconsistent (e.g., `participantId` or `userId` or `id`). Every API module normalizes before returning. If adding a new API call, handle field name variants.

### ⚠️ Event token vs event ID
Events have both `eventId` (internal) and `inviteToken` (URL-safe, used in routes). Always use `inviteToken` for navigation/URLs.

### ⚠️ JWT decode for host check
`edit-event-page.tsx` and `event-details-page.tsx` manually decode the JWT to extract the user ID (`sub` claim). This is intentional and avoids an extra API call. No library is used — it's raw base64url decode.

### ⚠️ Participant decision casing
`"approved"` and `"co_host"` are lowercase; `"REJECTED"` is uppercase — this matches backend expectations exactly. Don't normalize it.

### ⚠️ Service worker only in production
`ServiceWorkerRegister` component only registers the SW in `production` mode and HTTPS. In dev, the SW is not active.

### ⚠️ Cover photo not wired
The cover photo file input in `HostEventPage` displays the selected filename but **does not send the file** to the backend. Comment says "backend pending."

### ⚠️ Social login not wired
Google/Apple buttons exist in the login/register UI but are not connected to any API.

### ⚠️ Distance/attendee counts are fake
In the discover feed, distance calculation and attendee count are derived from event metadata (not real GPS or participation data). These are display approximations.

---

## 7. Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | Yes | Backend API base URL (e.g., `http://localhost:8081/api`) |
| `NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY` | Optional | VAPID public key for web push (base64url encoded) |

> Dev fallback for API URL: `http://localhost:8081/api` (hardcoded in `src/config/env.ts`)

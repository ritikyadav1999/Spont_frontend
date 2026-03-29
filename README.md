# Spont Frontend Foundation

Next.js + Tailwind + TypeScript foundation for the Spont real-time social discovery app.

## Stack

- Next.js (App Router)
- Tailwind CSS
- React Query
- Axios
- Zustand
- React Hook Form + Zod

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create environment file from template:

```bash
cp .env.example .env.local
```

3. Start the app:

```bash
npm run dev
```

## Folder Structure

```text
src/
  app/                  # App router pages/layout
  config/               # Env values, route constants, storage keys
  features/
    auth/
      api/              # Auth API functions
      components/       # Auth UI components
      hooks/            # Auth hooks
      schemas/          # Form validation schemas
      store/            # Zustand auth store
      types/            # Auth domain types
  lib/
    api/                # Shared API client + interceptors
    utils/              # Utility helpers
  providers/            # React Query + auth bootstrap providers
  types/                # Shared API envelope types
```

## Notes

- Login endpoint: `POST /api/auth/login` with `identifier` + `password`.
- Register endpoint: `POST /api/auth/register` with `name`, `email`, `password`, `gender`, `phone`.
- Register UI is implemented as a 2-step flow:
  - Step 1: `name`, `email`, `password`, `gender`
  - Step 2: `phone` and final submit
- API response envelope is expected as `{ success: boolean, data: ... }`.
- JWT token is currently stored in browser storage for MVP.
- API base URL is configured by `NEXT_PUBLIC_API_BASE_URL`.

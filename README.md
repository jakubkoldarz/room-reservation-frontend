# Room Reservation – Frontend

A web client for the room reservation system. Users log in, browse buildings and equipment, and manage them. The sections they can see depend on the permissions of their role.

Built with **Vue 3** (`<script setup>`), **TypeScript**, **Vite**, **Pinia**, **Vue Router** and **Tailwind CSS v4**.

## Requirements

-   Node.js 20+ and npm
-   The room reservation backend API running locally (default: `http://localhost:5000`)

## Getting started

```bash
npm install
```

Create a `.env` file in the project root. Git ignores this file, so you need to make it yourself:

```env
VITE_API_BASE_URL="http://localhost:5000"
```

Start the dev server:

```bash
npm run dev
```

## Scripts

| Command                | Description                                                                 |
| ---------------------- | --------------------------------------------------------------------------- |
| `npm run dev`          | Start the Vite dev server (includes Vue DevTools plugin)                    |
| `npm run build`        | Type-check with `vue-tsc` and build for production into `dist/`             |
| `npm run preview`      | Serve the production build locally                                          |
| `npm run generate:api` | Regenerate the typed API client from the backend's OpenAPI spec (see below) |

## API client

`src/api/generated.ts` is **auto-generated**. Don't edit it by hand. With the backend running, regenerate it whenever the API changes:

```bash
npm run generate:api
```

This runs [openapi-zod-client](https://github.com/astahmer/openapi-zod-client) against `http://localhost:5000/openapi/v1.json` and produces Zod schemas and a typed Zodios/axios client.

`src/api/client.ts` wraps the generated client:

-   reads the base URL from `VITE_API_BASE_URL`
-   sends cookies (`withCredentials`) so the refresh-token cookie works
-   adds `Authorization: Bearer <jwt>` from the auth store to each request
-   on a `401`, calls `/auth/refresh` once and retries the original request

Wrap API calls in the `useApiCall` composable (`src/composables/useApiCall.ts`). It returns an `ApiResult<T>` (`{ success, data }` or `{ success, error }`) and exposes `isLoading` and `error` refs:

```ts
const { call, isLoading } = useApiCall();
const result = await call(() => apiClient.getEquipment());
if (result.success) {
    /* result.data */
}
```

## Authentication and permissions

-   The JWT is kept in the Pinia `auth` store and persisted to `localStorage` (`pinia-plugin-persistedstate`).
-   On startup (`main.ts`), `authStore.init()` fetches `/auth/me`. If that fails, it tries a token refresh, and if the refresh also fails, it logs the user out.
-   The user's permissions come from `user.roleInfo.permissions`. Check them with `usePermissions().hasPermission(...)`. The available permission keys are listed in `src/features/auth/constants/permissions.ts`.

Routes declare their access rules in `meta` (typed in `src/router/meta.ts`):

| Meta field           | Effect                                            |
| -------------------- | ------------------------------------------------- |
| `requiresAuth`       | Logged-out users are redirected to the login page |
| `requiresGuest`      | Logged-in users are redirected to the dashboard   |
| `requiredPermission` | Users without this permission go to the dashboard |

## Project structure

```
src/
├── api/             # Generated API client + configured axios instance
├── composables/     # App-wide composables (useApiCall, usePermissions, useDate, ...)
├── features/        # Feature modules (see below)
├── router/          # Router setup, global guards, RouteMeta typings
├── types/           # Shared types (DTOs, API results/errors, ...)
├── main.ts          # App bootstrap (Pinia, auth init, router)
└── style.css        # Tailwind entry point and global styles
```

The code is organised **by feature**. Each folder in `src/features/` can contain:

```
features/<feature>/
├── components/   # Components used only by this feature
├── composables/  # Feature-specific logic
├── stores/       # Pinia stores
├── views/        # Route-level pages
├── routes.ts     # Route definitions for this feature
└── types.ts
```

Current features include `auth`, `dashboard`, `buildings`, `equipment` and `availabilities`. There are also reusable UI modules: `table`, `pager`, `filters`, `modal`, `toasts`, `layouts` and `shared` (buttons, inputs, badges, navbar, ...).

### Adding a new feature

1. Create `src/features/<name>/` following the layout above.
2. Define routes in `routes.ts` as an object `satisfies Record<string, RouteRecordRaw>`, with route names like `<name>.list`, `<name>.view` and so on, plus the right `meta`.
3. Spread the routes into the `routes` array in `src/router/index.ts`.
4. If new permissions are needed, add them to `src/features/auth/constants/permissions.ts`.

## Conventions

-   Import from `src` using the `@/` alias, for example `@/features/shared/BaseButton.vue`.
-   Load route components lazily with `() => import(...)`.
-   Validate forms with `vee-validate` and `zod` (`@vee-validate/zod`).
-   Use icons from `@heroicons/vue`.

## Recommended IDE setup

[VS Code](https://code.visualstudio.com/) with the [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) extension.

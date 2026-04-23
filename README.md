# Angular SaaS Starter

> ⚠️ **Work in progress.** This starter is actively evolving and has known rough edges and open issues. It's usable today as a baseline, but expect breaking changes. **Contributions are warmly welcome** — feel free to open an issue or PR.

A batteries-included starter for building modern SaaS dashboards on **Angular 21** and **PrimeNG 21**, with authentication, role-based permissions, theming, and i18n wired up out of the box.

[![Angular](https://img.shields.io/badge/Angular-21-DD0031?logo=angular&logoColor=white)](https://angular.dev)
[![PrimeNG](https://img.shields.io/badge/PrimeNG-21-007ACC)](https://primeng.org)
[![Status](https://img.shields.io/badge/status-WIP-yellow)](https://github.com/erkamyaman/angular-saas-starter)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## Why this starter

Spinning up a SaaS frontend usually means re-solving the same problems: auth + token refresh, route guards, layout shells, theming, translations, error handling, toasts. This repo bundles a clean, opinionated baseline so you can skip the plumbing and focus on the product.

## Features

- **Angular 21** with standalone components, signals, and lazy-loaded routes.
- **PrimeNG 21** UI library with the **Material** preset from `@primeuix/themes`.
- **Authentication** — login, register, JWT access + refresh tokens, persistent session, `/auth/me` rehydration on app init.
- **Route guards** — `authGuard`, `guestGuard`, and `permissionGuard`.
- **Role-based permissions** with a typed permission key map.
- **HTTP interceptors** for attaching tokens, refresh-on-401, and centralized error toasts (with opt-out via `HttpContext`).
- **Internationalization** with `@ngx-translate` — English, Spanish, Turkish, and Ukrainian shipped, browser language detection, persisted preference.
- **Theme picker** — runtime primary-color switching across 14 palettes via `@primeuix/themes`, persisted to `localStorage`.
- **App shell layout** with responsive topbar, sidebar, and a separate public layout for unauthenticated pages.
- **Users CRUD** feature with permission-gated actions, dialog form, and a reusable data table.
- **Loading service** wired to the router for an automatic top-of-page progress bar.
- **Centralized error handling** via a custom `ErrorHandler` and HTTP error interceptor.
- **Vitest** unit tests for auth, guards, interceptors, and forms.
- **Prettier** + EditorConfig defaults.

## Tech stack

| Area              | Choice                                             |
| ----------------- | -------------------------------------------------- |
| Framework         | Angular 21 (standalone APIs, signals)              |
| UI                | PrimeNG 21 + PrimeIcons                            |
| Theme             | `@primeuix/themes` (Material preset, custom token) |
| HTTP              | `HttpClient` + functional interceptors             |
| State             | Signals + RxJS where async                         |
| i18n              | `@ngx-translate/core` + HTTP loader                |
| Tests             | Vitest + JSDOM                                     |
| Tooling           | Angular CLI 21, Prettier 3                         |

## Project structure

```
src/app/
├── core/                # cross-cutting concerns
│   ├── auth/            # AuthService, models, storage
│   ├── guards/          # auth, guest, permission
│   ├── i18n/            # language service, supported langs
│   ├── interceptors/    # auth + error interceptors, HttpContext keys
│   ├── services/        # toast, confirm, loading
│   ├── theme/           # theme service + palette tokens
│   └── error-handler.ts
├── features/            # feature modules (lazy-loaded)
│   ├── auth/            # login, register pages
│   ├── dashboard/
│   ├── errors/          # not-found, access-denied
│   ├── settings/
│   └── users/           # users CRUD
├── layouts/
│   ├── app-layout/      # authenticated shell (topbar, sidebar)
│   └── public-layout/   # unauthenticated pages
└── shared/              # reusable components, directives, pipes, models

public/i18n/             # translation JSON files (en, es, tr, uk)
```

## Getting started

### Prerequisites

- Node.js 20+
- npm 11+

### Install

```bash
npm install
```

### Configure the API base URL

Edit `src/environments/environment.ts` and point `apiUrl` at your backend.

By default, `AuthService` (`src/app/core/auth/auth.service.ts`) calls these endpoints — rename them to match your API if needed:

| Purpose          | Default endpoint   |
| ---------------- | ------------------ |
| Sign in          | `POST /auth/login` |
| Sign up          | `POST /auth/register` |
| Sign out         | `POST /auth/logout` |
| Refresh tokens   | `POST /auth/refresh` |
| Current user     | `GET  /auth/me`    |

The expected request/response shapes live in `src/app/core/auth/auth.models.ts`.

### Run

```bash
ng serve
```

The app serves at `http://localhost:4200` and reloads on changes.

### Build

```bash
ng build
```

Outputs production bundles to `dist/`.

### Test

```bash
ng test
```

Runs the Vitest suite (auth service, guards, interceptors, user form).

> The npm scripts (`npm start`, `npm run build`, `npm test`) wrap the same commands if you'd rather not install the Angular CLI globally.

## Adding a translated string

1. Add the key to every file in `public/i18n/` (`en.json`, `es.json`, `tr.json`, `uk.json`).
2. Use it in a template:

   ```html
   {{ 'users.create' | translate }}
   ```

The fallback language is `en`. New languages can be added by extending `SUPPORTED_LANGS` in `src/app/core/i18n/language.service.ts` and dropping a matching JSON file in `public/i18n/`.

## Adding a permission-gated route

```ts
{
  path: 'admin',
  canActivate: [authGuard, permissionGuard('admin.view')],
  loadComponent: () => import('./features/admin/admin').then((m) => m.Admin),
}
```

Permission keys are mapped to roles in `src/app/core/auth/auth.service.ts`. Adjust `ROLE_PERMISSIONS` to match your domain.

## Theming

The active primary color is set at runtime via `ThemeService.set(color)` and persisted to `localStorage` under `app:theme-primary`. Available palettes are listed in `SUPPORTED_COLORS` (`src/app/core/theme/theme.service.ts`). Material is the default preset — swap it in `src/app/app.config.ts` if you prefer Aura, Lara, or Nora.

## License

[MIT](LICENSE) © Erkam Yaman

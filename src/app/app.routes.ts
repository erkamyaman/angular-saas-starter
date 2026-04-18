import { Routes } from '@angular/router';
import { AppLayout } from './layouts/app-layout/app-layout';
import { PublicLayout } from './layouts/public-layout/public-layout';

export const routes: Routes = [
  {
    path: '',
    component: AppLayout,
    // TODO: add authGuard here once auth is wired — block unauthenticated access to the app shell.
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
    ],
  },
  {
    path: '',
    component: PublicLayout,
    // TODO: add guestGuard here once auth is wired — redirect logged-in users away from /login.
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  // TODO: revisit once auth lands — unauthenticated users hitting an unknown path should land on /login, not /dashboard.
  { path: '**', redirectTo: 'dashboard' },
];

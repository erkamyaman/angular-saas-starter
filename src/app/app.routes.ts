import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { AppLayout } from './layouts/app-layout/app-layout';
import { PublicLayout } from './layouts/public-layout/public-layout';

export const routes: Routes = [
  {
    path: '',
    component: AppLayout,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'access-denied',
        loadComponent: () =>
          import('./features/errors/pages/access-denied/access-denied').then((m) => m.AccessDenied),
      },
    ],
  },
  {
    path: '',
    component: PublicLayout,
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  { path: '**', redirectTo: 'dashboard' },
];

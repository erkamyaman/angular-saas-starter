import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const permissionGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login'], {
      queryParams: { redirectTo: state.url },
    });
  }

  const required = route.data?.['permission'] as string | undefined;
  if (!required || auth.hasPermission(required)) return true;

  return router.createUrlTree(['/access-denied'], {
    queryParams: { permission: required },
  });
};

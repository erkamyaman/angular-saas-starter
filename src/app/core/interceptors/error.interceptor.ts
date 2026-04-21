import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { EnvironmentInjector, inject, runInInjectionContext } from '@angular/core';
import { Observable, Subject, catchError, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { ToastService } from '../services/toast.service';
import { SKIP_ERROR_TOAST } from './http-context';

let refreshing = false;
const refreshSubject = new Subject<string | null>();

const SKIP_REFRESH = [
  /\/auth\/refresh$/,
  /\/auth\/login$/,
  /\/auth\/logout$/,
  /\/auth\/register$/,
];

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const injector = inject(EnvironmentInjector);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !skipRefresh(req.url)) {
        return handle401(req, next, auth);
      }
      if (!req.context.get(SKIP_ERROR_TOAST)) {
        runInInjectionContext(injector, () => {
          surfaceError(err, inject(ToastService));
        });
      }
      return throwError(() => err);
    }),
  );
};

function skipRefresh(url: string): boolean {
  return SKIP_REFRESH.some((re) => re.test(url));
}

function handle401(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  auth: AuthService,
): Observable<HttpEvent<unknown>> {
  if (refreshing) {
    return refreshSubject.pipe(
      take(1),
      switchMap((token) => {
        if (token === null) {
          return throwError(() => new Error('Token refresh failed'));
        }
        return next(retryWithToken(req, token));
      }),
    );
  }

  refreshing = true;
  return auth.refresh().pipe(
    switchMap((tokens) => {
      refreshing = false;
      refreshSubject.next(tokens.accessToken);
      return next(retryWithToken(req, tokens.accessToken));
    }),
    catchError((refreshErr) => {
      refreshing = false;
      refreshSubject.next(null);
      return auth.signOut().pipe(
        catchError(() => throwError(() => refreshErr)),
        switchMap(() => throwError(() => refreshErr)),
      );
    }),
  );
}

function retryWithToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

function surfaceError(err: HttpErrorResponse, toast: ToastService): void {
  const body = err.error as { message?: string } | null;
  const detail = body?.message ?? undefined;

  let summaryKey = 'error_generic';
  if (err.status === 403) summaryKey = 'error_forbidden';
  else if (err.status === 429) summaryKey = 'error_too_many_requests';
  else if (err.status >= 500) summaryKey = 'error_server';
  else if (err.status === 0) summaryKey = 'error_network';

  toast.error(summaryKey, { detail });
}

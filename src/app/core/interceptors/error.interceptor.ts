import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Observable, Subject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

let refreshing = false;
const refreshSubject = new Subject<string | null>();

const REFRESH_URL = /\/auth\/refresh$/;
const LOGIN_URL = /\/auth\/login$/;

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const toast = inject(MessageService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !REFRESH_URL.test(req.url) && !LOGIN_URL.test(req.url)) {
        return handle401(req, next, auth);
      }
      surfaceError(err, toast);
      return throwError(() => err);
    }),
  );
};

function handle401(
  req: HttpRequest<unknown>,
  next: Parameters<HttpInterceptorFn>[1],
  auth: AuthService,
): Observable<ReturnType<Parameters<HttpInterceptorFn>[1]> extends Observable<infer R> ? R : never> {
  if (refreshing) {
    return refreshSubject.pipe(
      filter((t): t is string => t !== null),
      take(1),
      switchMap((token) => next(retryWithToken(req, token))),
    ) as never;
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
      auth.signOut().subscribe();
      return throwError(() => refreshErr);
    }),
  ) as never;
}

function retryWithToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

function surfaceError(err: HttpErrorResponse, toast: MessageService): void {
  const body = err.error as { message?: string } | null;
  const fallback = err.status === 0
    ? 'Network error — check your connection.'
    : err.statusText || 'Request failed';
  const detail = body?.message ?? fallback;

  let summary = 'Error';
  if (err.status === 403) summary = 'Forbidden';
  else if (err.status === 429) summary = 'Too many requests';
  else if (err.status >= 500) summary = 'Server error';
  else if (err.status === 0) summary = 'Network';

  toast.add({ severity: 'error', summary, detail, life: 5000 });
}

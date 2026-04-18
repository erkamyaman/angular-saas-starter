import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { Observable, delay, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

const LATENCY_MS = 300;

const MOCK_USER = {
  id: 'mock-user-1',
  email: 'demo@example.com',
  firstName: 'Demo',
  lastName: 'User',
  permissions: {
    'admin.view': true,
    'projects.view': true,
    'projects.create': true,
  },
};

const MOCK_TOKENS = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
};

export const devMockInterceptor: HttpInterceptorFn = (req, next) => {
  if (!environment.useMockApi) return next(req);

  const is = (method: string, pattern: RegExp) =>
    req.method === method && pattern.test(req.url);

  if (is('POST', /\/auth\/login$/)) {
    const body = req.body as { email?: string; password?: string } | null;
    if (!body?.email || !body?.password || body.password.length < 6) {
      return reject(401, 'Invalid credentials');
    }
    console.info('[DevMock] POST /auth/login →', body.email);
    return ok({ user: { ...MOCK_USER, email: body.email }, tokens: MOCK_TOKENS });
  }

  if (is('POST', /\/auth\/register$/)) {
    const body = req.body as { email?: string; password?: string; firstName?: string; lastName?: string } | null;
    if (!body?.email || !body?.password) {
      return reject(400, 'Missing required fields');
    }
    console.info('[DevMock] POST /auth/register →', body.email);
    return ok({
      user: {
        ...MOCK_USER,
        email: body.email,
        firstName: body.firstName ?? MOCK_USER.firstName,
        lastName: body.lastName ?? MOCK_USER.lastName,
      },
      tokens: MOCK_TOKENS,
    });
  }

  if (is('POST', /\/auth\/refresh$/)) {
    console.info('[DevMock] POST /auth/refresh');
    return ok(MOCK_TOKENS);
  }

  if (is('POST', /\/auth\/logout$/)) {
    console.info('[DevMock] POST /auth/logout');
    return ok({ message: 'ok' });
  }

  if (is('GET', /\/auth\/me$/)) {
    console.info('[DevMock] GET /auth/me');
    return ok(MOCK_USER);
  }

  return next(req);
};

function ok(body: unknown): Observable<HttpResponse<unknown>> {
  return of(new HttpResponse({ status: 200, body })).pipe(delay(LATENCY_MS));
}

function reject(status: number, message: string): Observable<never> {
  return throwError(
    () =>
      new HttpErrorResponse({
        status,
        statusText: message,
        error: { statusCode: status, message },
      }),
  ).pipe(delay(LATENCY_MS));
}

import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { Observable, delay, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ManagedUser, UserWritable } from '../../features/users/models/user.model';

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
    'users.view': true,
    'users.manage': true,
  },
};

const MOCK_TOKENS = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
};

const MOCK_USERS: ManagedUser[] = [
  { id: 'u-1', email: 'alice@example.com', firstName: 'Alice', lastName: 'Anderson', role: 'admin', status: 'active', createdAt: '2025-11-02T09:12:00Z' },
  { id: 'u-2', email: 'ben@example.com', firstName: 'Ben', lastName: 'Baker', role: 'member', status: 'active', createdAt: '2025-11-15T14:32:00Z' },
  { id: 'u-3', email: 'carla@example.com', firstName: 'Carla', lastName: 'Cruz', role: 'member', status: 'invited', createdAt: '2025-12-01T08:05:00Z' },
  { id: 'u-4', email: 'dan@example.com', firstName: 'Dan', lastName: 'Davis', role: 'viewer', status: 'active', createdAt: '2026-01-08T11:20:00Z' },
  { id: 'u-5', email: 'eve@example.com', firstName: 'Eve', lastName: 'Evans', role: 'viewer', status: 'disabled', createdAt: '2026-01-21T16:44:00Z' },
  { id: 'u-6', email: 'finn@example.com', firstName: 'Finn', lastName: 'Foster', role: 'member', status: 'active', createdAt: '2026-02-04T10:00:00Z' },
  { id: 'u-7', email: 'gina@example.com', firstName: 'Gina', lastName: 'Graham', role: 'admin', status: 'active', createdAt: '2026-02-19T13:11:00Z' },
  { id: 'u-8', email: 'henry@example.com', firstName: 'Henry', lastName: 'Hughes', role: 'member', status: 'invited', createdAt: '2026-03-03T09:47:00Z' },
  { id: 'u-9', email: 'iris@example.com', firstName: 'Iris', lastName: 'Ibarra', role: 'viewer', status: 'active', createdAt: '2026-03-17T15:30:00Z' },
  { id: 'u-10', email: 'jack@example.com', firstName: 'Jack', lastName: 'Jensen', role: 'member', status: 'active', createdAt: '2026-04-05T12:02:00Z' },
];

let nextUserSeq = MOCK_USERS.length + 1;

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

  if (is('GET', /\/users\/columns$/)) {
    console.info('[DevMock] GET /users/columns');
    return ok({
      columns: [
        { field: 'name', header: 'name', sortable: false },
        { field: 'email', header: 'email', sortable: true },
        { field: 'role', header: 'role', sortable: true, width: '120px' },
        { field: 'status', header: 'status', sortable: true, width: '120px' },
        { field: 'createdAt', header: 'created_at', sortable: true, width: '160px' },
      ],
    });
  }

  if (is('GET', /\/users$/)) {
    const first = Number(req.params.get('first') ?? 0);
    const pageSize = Number(req.params.get('pageSize') ?? MOCK_USERS.length);
    const sortField = req.params.get('sortField');
    const sortOrder = Number(req.params.get('sortOrder') ?? 1) as 1 | -1;

    let data = [...MOCK_USERS];
    if (sortField) {
      data.sort((a, b) => {
        const va = (a as unknown as Record<string, unknown>)[sortField];
        const vb = (b as unknown as Record<string, unknown>)[sortField];
        if (va == null && vb == null) return 0;
        if (va == null) return -sortOrder;
        if (vb == null) return sortOrder;
        if (va < vb) return -sortOrder;
        if (va > vb) return sortOrder;
        return 0;
      });
    }

    const slice = data.slice(first, first + pageSize);
    console.info(`[DevMock] GET /users ?first=${first}&pageSize=${pageSize}&sortField=${sortField ?? ''}&sortOrder=${sortOrder}`);
    return ok({ data: slice, total: MOCK_USERS.length });
  }

  const byId = req.url.match(/\/users\/([^/?]+)$/);
  if (byId) {
    const id = byId[1];
    const idx = MOCK_USERS.findIndex((u) => u.id === id);

    if (req.method === 'GET') {
      if (idx < 0) return reject(404, 'User not found');
      return ok(MOCK_USERS[idx]);
    }

    if (req.method === 'PATCH') {
      if (idx < 0) return reject(404, 'User not found');
      const patch = req.body as Partial<UserWritable> | null;
      if (!patch) return reject(400, 'Missing body');
      MOCK_USERS[idx] = { ...MOCK_USERS[idx], ...patch };
      console.info('[DevMock] PATCH /users/' + id);
      return ok(MOCK_USERS[idx]);
    }

    if (req.method === 'DELETE') {
      if (idx < 0) return reject(404, 'User not found');
      MOCK_USERS.splice(idx, 1);
      console.info('[DevMock] DELETE /users/' + id);
      return ok({ message: 'ok' });
    }
  }

  if (is('POST', /\/users$/)) {
    const body = req.body as Partial<UserWritable> | null;
    if (!body?.email || !body?.firstName || !body?.lastName || !body?.role || !body?.status) {
      return reject(400, 'Missing required fields');
    }
    if (MOCK_USERS.some((u) => u.email.toLowerCase() === body.email!.toLowerCase())) {
      return reject(409, 'Email already in use');
    }
    const created: ManagedUser = {
      id: `u-${nextUserSeq++}`,
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      role: body.role,
      status: body.status,
      createdAt: new Date().toISOString(),
    };
    MOCK_USERS.unshift(created);
    console.info('[DevMock] POST /users →', created.email);
    return ok(created);
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

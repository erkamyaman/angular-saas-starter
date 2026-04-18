import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SKIP_ERROR_TOAST } from '../interceptors/http-context';
import { clearAuth, readAuth, writeAuth } from './auth-storage';
import {
  AuthResponse,
  AuthTokens,
  Credentials,
  RegisterData,
  User,
} from './auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly api = `${environment.apiUrl}/auth`;
  private readonly silent = { context: new HttpContext().set(SKIP_ERROR_TOAST, true) };

  private readonly stored = readAuth();
  readonly currentUser = signal<User | null>(this.stored?.user ?? null);
  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  getAccessToken(): string | null {
    return readAuth()?.accessToken ?? null;
  }

  getRefreshToken(): string | null {
    return readAuth()?.refreshToken ?? null;
  }

  signIn(credentials: Credentials): Observable<User> {
    return this.http.post<AuthResponse>(`${this.api}/login`, credentials, this.silent).pipe(
      tap((res) => this.persistSession(res)),
      map((res) => res.user),
    );
  }

  signUp(data: RegisterData): Observable<User> {
    return this.http.post<AuthResponse>(`${this.api}/register`, data, this.silent).pipe(
      tap((res) => this.persistSession(res)),
      map((res) => res.user),
    );
  }

  signOut(): Observable<void> {
    const access = this.getAccessToken();
    const finalize = () => {
      clearAuth();
      this.currentUser.set(null);
      this.router.navigateByUrl('/login');
    };

    if (!access) {
      finalize();
      return of(void 0);
    }

    return this.http.post<void>(`${this.api}/logout`, {}, this.silent).pipe(
      catchError(() => of(void 0)),
      tap(() => finalize()),
    );
  }

  refresh(): Observable<AuthTokens> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }
    return this.http
      .post<AuthTokens>(`${this.api}/refresh`, { refreshToken }, this.silent)
      .pipe(tap((tokens) => this.persistTokens(tokens)));
  }

  loadCurrentUser(): Observable<User | null> {
    if (!this.getAccessToken()) {
      return of(null);
    }
    return this.http.get<User>(`${this.api}/me`, this.silent).pipe(
      tap((user) => {
        this.currentUser.set(user);
        const existing = readAuth();
        if (existing) {
          writeAuth({ ...existing, user });
        }
      }),
      catchError(() => {
        clearAuth();
        this.currentUser.set(null);
        return of(null);
      }),
    );
  }

  hasPermission(key: string): boolean {
    const perms = this.currentUser()?.permissions;
    return !!perms && perms[key] === true;
  }

  private persistSession(res: AuthResponse): void {
    writeAuth({
      accessToken: res.tokens.accessToken,
      refreshToken: res.tokens.refreshToken,
      user: res.user,
    });
    this.currentUser.set(res.user);
  }

  private persistTokens(tokens: AuthTokens): void {
    const existing = readAuth();
    if (!existing) return;
    writeAuth({ ...existing, ...tokens });
  }
}

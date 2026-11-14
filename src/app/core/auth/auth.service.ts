
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import {
  Observable,
  of,
  throwError
} from 'rxjs';

import {
  catchError,
  finalize,
  shareReplay,
  switchMap,
  tap
} from 'rxjs/operators';

import { API_CONFIG } from '../config/api.config';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  // Complete backend authentication URL
  private readonly authUrl =
    `${API_CONFIG.baseUrl}${API_CONFIG.authUrl}`;

  private readonly ACCESS_TOKEN_KEY = 'dap_access_token';
  private readonly REFRESH_TOKEN_KEY = 'dap_refresh_token';
  private readonly TOKEN_TYPE_KEY = 'dap_token_type';

  private refreshRequest$: Observable<LoginResponse> | null = null;

  // LOGIN
  login(credentials: LoginRequest): Observable<LoginResponse> {

    return this.http.post<LoginResponse>(
      `${this.authUrl}/login`,
      credentials
    ).pipe(
      switchMap(response => {

        // Only administrators can access Admin Portal
        if (!this.tokenHasRole(response.accessToken, 'ROLE_ADMIN')) {

          return this.http.post<void>(
            `${this.authUrl}/logout`,
            { refreshToken: response.refreshToken }
          ).pipe(
            catchError(() => of(undefined)),
            switchMap(() => throwError(
              () => new Error(
                'This account does not have administrator access.'
              )
            ))
          );
        }

        this.storeTokens(response);

        return of(response);
      })
    );
  }

  // REFRESH ACCESS TOKEN
  refreshAccessToken(): Observable<LoginResponse> {

    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      return throwError(
        () => new Error('Refresh token not available')
      );
    }

    if (!this.refreshRequest$) {

      this.refreshRequest$ = this.http.post<LoginResponse>(
        `${this.authUrl}/refresh`,
        { refreshToken }
      ).pipe(
        tap(response => this.storeTokens(response)),
        finalize(() => {
          this.refreshRequest$ = null;
        }),
        shareReplay(1)
      );
    }

    return this.refreshRequest$;
  }

  // LOGOUT
  logout(): Observable<void> {

    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      this.clearSession();
      return of(undefined);
    }

    return this.http.post<void>(
      `${this.authUrl}/logout`,
      { refreshToken }
    ).pipe(
      catchError(() => of(undefined)),
      finalize(() => {
        this.clearSession();
        this.router.navigate(['/login']);
      })
    );
  }

  // STORE TOKENS
  storeTokens(response: LoginResponse): void {

    sessionStorage.setItem(
      this.ACCESS_TOKEN_KEY,
      response.accessToken
    );

    sessionStorage.setItem(
      this.REFRESH_TOKEN_KEY,
      response.refreshToken
    );

    sessionStorage.setItem(
      this.TOKEN_TYPE_KEY,
      response.tokenType || 'Bearer'
    );
  }

  // GET ACCESS TOKEN
  getAccessToken(): string | null {
    return sessionStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  // GET REFRESH TOKEN
  getRefreshToken(): string | null {
    return sessionStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  // GET TOKEN TYPE
  getTokenType(): string {
    return sessionStorage.getItem(this.TOKEN_TYPE_KEY) || 'Bearer';
  }

  // CHECK AUTHENTICATION
  isAuthenticated(): boolean {
    return !!this.getAccessToken() && !!this.getRefreshToken();
  }

  // CHECK ROLE
  hasRole(role: string): boolean {

    const token = this.getAccessToken();

    if (!token) {
      return false;
    }

    return this.tokenHasRole(token, role);
  }

  // DECODE JWT AND CHECK ROLE
  private tokenHasRole(token: string, role: string): boolean {

    try {

      const payload = token.split('.')[1];

      if (!payload) {
        return false;
      }

      const base64 = payload
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      const decoded = JSON.parse(
        atob(base64)
      );

      const roles: string[] = decoded.roles || [];

      return roles.includes(role);

    } catch {
      return false;
    }
  }

  // CLEAR SESSION
  clearSession(): void {

    sessionStorage.removeItem(this.ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(this.TOKEN_TYPE_KEY);
  }
}

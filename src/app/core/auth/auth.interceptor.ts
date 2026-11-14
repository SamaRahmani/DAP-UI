
import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpErrorResponse
} from '@angular/common/http';

import { Router } from '@angular/router';

import {
  catchError,
  switchMap,
  throwError
} from 'rxjs';

import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthEndpoint =
    req.url.includes('/api/auth/login') ||
    req.url.includes('/api/auth/signup') ||
    req.url.includes('/api/auth/refresh') ||
    req.url.includes('/api/auth/logout');

  if (isAuthEndpoint) {
    return next(req);
  }

  const token = authService.getAccessToken();

  const authRequest = token
    ? req.clone({
        setHeaders: {
          Authorization: `${authService.getTokenType()} ${token}`
        }
      })
    : req;

  return next(authRequest).pipe(
    catchError((error: HttpErrorResponse) => {

      if (error.status !== 401 || !authService.getRefreshToken()) {
        return throwError(() => error);
      }

      return authService.refreshAccessToken().pipe(

        switchMap(response => {

          const retryRequest = req.clone({
            setHeaders: {
              Authorization: `${response.tokenType || 'Bearer'} ${response.accessToken}`
            }
          });

          return next(retryRequest);
        }),

        catchError(refreshError => {

          authService.clearSession();
          router.navigate(['/login']);

          return throwError(() => refreshError);
        })
      );
    })
  );
};

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { ConfigService } from '../../../core/services/config.service';
import { StorageService } from '../storge/storage.service';
import { LoginCredentials, LoginResponse } from '../../../type/login';




@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Dependency Injection
  private http = inject(HttpClient);
  private configService = inject(ConfigService);
  private storageService = inject(StorageService);

  // Authentication State Management
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Authentication Endpoints
  private loginEndpoint: string;
  private refreshTokenEndpoint: string;

  constructor() {
    // Initialize endpoints from environment configuration
    const apiBaseUrl = this.configService.getApiEndpoint('auth');
    this.loginEndpoint = `${apiBaseUrl}/login`;
    this.refreshTokenEndpoint = `${apiBaseUrl}/refresh-token`;
    
    // Restore user session on service initialization
    this.restoreSession();
  }

  /**
   * Perform user login
   * @param credentials User login credentials
   * @returns Observable of login response
   */
  login(credentials: LoginCredentials): Observable<any> {
    return this.http.post<any>(this.loginEndpoint, credentials).pipe(
      tap(response => { 
        try {
          console.log(response.status)
          if (response.status === 204) return;
  
          this.handleSuccessfulLogin(response)

        }catch(e) {
          console.log("error", e);
        }
      }),
      catchError(this.handleLoginError)
    );
  }

  /**
   * Handle successful login
   * @param response Login response from server
   */
  private handleSuccessfulLogin(response: LoginResponse): void {
    if (!response.token) {
      throw new Error('Invalid login response');
    }

    // Store authentication tokens
    this.storageService.setItem(
      this.configService.getAuthConfig().tokenKey,
      response.token
    );

    this.storageService.setItem(
      this.configService.getAuthConfig().refreshTokenKey,
      response.refreshToken
    );

    // // Update current user
    this.currentUserSubject.next(response.user);

    // Log login (if logging enabled)
    if (this.configService.isFeatureEnabled('logging')) {
      console.log('User logged in successfully', response.user);
    }
  }

  /**
   * Handle login errors
   * @param error HTTP error response
   */
  private handleLoginError = (error: HttpErrorResponse) => {
    let errorMessage = 'Login failed. Please try again.';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 401:
          errorMessage = 'Invalid username or password';
          break;
        case 403:
          errorMessage = 'Access denied';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
      }
    }

    // Log error (if logging enabled)
    if (this.configService.isFeatureEnabled('logging')) {
      console.error('Login Error:', errorMessage);
    }

    return throwError(() => new Error(errorMessage));
  }

  /**
   * Refresh authentication token
   * @returns Observable of new authentication token
   */
  refreshToken(): Observable<string> {
    const refreshToken = this.storageService.getItem(
      this.configService.getAuthConfig().refreshTokenKey
    );

    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<{token: string}>(
      this.refreshTokenEndpoint,
      { refreshToken }
    ).pipe(
      map(response => {
        // Update access token
        this.storageService.setItem(
          this.configService.getAuthConfig().tokenKey,
          response.token
        );
        return response.token;
      }),
      catchError(this.handleRefreshTokenError)
    );
  }

  /**
   * Handle refresh token errors
   * @param error HTTP error response
   */
  private handleRefreshTokenError = (error: HttpErrorResponse) => {
    // Automatic logout on refresh token failure
    this.logout();
    return throwError(() => new Error('Session expired. Please log in again.'));
  }

  /**
   * Check if user is authenticated
   * @returns Boolean indicating authentication status
   */
  isAuthenticated(): boolean {
    const token = this.storageService.getItem(
      this.configService.getAuthConfig().tokenKey
    );

    // Additional token validation can be added here
    return !!token;
  }

  /**
   * Get current user roles
   * @returns Array of user roles
   */
  getUserRoles(): string[] {
    const user = this.currentUserSubject.getValue();
    return user?.roles || [];
  }

  /**
   * Check if user has specific role
   * @param role Role to check
   * @returns Boolean indicating role presence
   */
  hasRole(role: string): boolean {
    return this.getUserRoles().includes(role);
  }

  /**
   * Restore user session from storage
   */
  private restoreSession(): void {
    const token = this.storageService.getItem(
      this.configService.getAuthConfig().tokenKey
    );

    if (token) {
      // Optionally validate token and restore user data
      // This would typically involve a server-side token validation
      // For now, we'll just log the restoration
      if (this.configService.isFeatureEnabled('logging')) {
        console.log('Session restored');
      }
    }
  }

  /**
   * Logout user
   */
  logout(): void {
    // Clear tokens
    this.storageService.removeItem(
      this.configService.getAuthConfig().tokenKey
    );
    this.storageService.removeItem(
      this.configService.getAuthConfig().refreshTokenKey
    );

    // Reset current user
    this.currentUserSubject.next(null);

    // Log logout (if logging enabled)
    if (this.configService.isFeatureEnabled('logging')) {
      console.log('User logged out');
    }

    // Additional logout logic (e.g., navigate to login page)
    // This would typically be handled in the component
  }
}


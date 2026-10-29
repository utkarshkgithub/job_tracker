import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  ChangePasswordRequest,
  LoginRequest,
  RegisterRequest,
  UpdatePreferencesRequest,
  UpdateProfileRequest,
  User
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly TOKEN_KEY = 'careerflow_token';
  private readonly USER_KEY = 'careerflow_user';

  currentUser = signal<User | null>(this.getStoredUser());
  token = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));
  isAuthenticated = computed(() => !!this.token());

  constructor() {
    this.applyCurrentTheme();
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, request).pipe(
      tap(res => this.setSession(res))
    );
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, request).pipe(
      tap(res => this.setSession(res))
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.token.set(null);
    this.currentUser.set(null);
    this.applyTheme('system');
    this.router.navigate(['/login']);
  }

  forgotPassword(email: string): Observable<{ message: string; success: boolean }> {
    return this.http.post<{ message: string; success: boolean }>(`${environment.apiUrl}/auth/forgot-password`, { email });
  }

  updateProfile(request: UpdateProfileRequest): Observable<{ data: User; message: string }> {
    return this.http.put<{ data: User; message: string }>(`${environment.apiUrl}/settings/profile`, request).pipe(
      tap(res => {
        if (res.data) {
          this.currentUser.set(res.data);
          localStorage.setItem(this.USER_KEY, JSON.stringify(res.data));
        }
      })
    );
  }

  changePassword(request: ChangePasswordRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/settings/change-password`, request);
  }

  updatePreferences(request: UpdatePreferencesRequest): Observable<{ data: User; message: string }> {
    return this.http.put<{ data: User; message: string }>(`${environment.apiUrl}/settings/preferences`, request).pipe(
      tap(res => {
        if (res.data) {
          this.currentUser.set(res.data);
          localStorage.setItem(this.USER_KEY, JSON.stringify(res.data));
          this.applyTheme(res.data.theme);
        }
      })
    );
  }

  getToken(): string | null {
    return this.token();
  }

  applyTheme(theme: 'light' | 'dark' | 'system'): void {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else if (theme === 'light') {
      root.removeAttribute('data-theme');
    } else {
      // System preference
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.setAttribute('data-theme', 'dark');
      } else {
        root.removeAttribute('data-theme');
      }
    }
  }

  private setSession(authResult: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, authResult.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(authResult.user));
    this.token.set(authResult.token);
    this.currentUser.set(authResult.user);
    this.applyTheme(authResult.user.theme);
  }

  private getStoredUser(): User | null {
    const json = localStorage.getItem(this.USER_KEY);
    if (!json) return null;
    try {
      return JSON.parse(json) as User;
    } catch {
      return null;
    }
  }

  private applyCurrentTheme(): void {
    const user = this.getStoredUser();
    this.applyTheme(user?.theme || 'system');
  }
}

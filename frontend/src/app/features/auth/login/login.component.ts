import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-wrapper">
      <div class="auth-card">
        <div class="auth-header">
          <h1 class="auth-title">CareerFlow</h1>
          <p class="auth-subtitle">Sign in to manage your job applications</p>
        </div>

        @if (errorMessage) {
          <div class="auth-alert error-alert" role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{{ errorMessage }}</span>
          </div>
        }

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" novalidate>
          <div class="form-group">
            <label class="form-label" for="login-email">
              Email <span class="required">*</span>
            </label>
            <input
              id="login-email"
              type="email"
              class="form-control"
              [class.is-invalid]="isFieldInvalid('email')"
              formControlName="email"
              placeholder="you@domain.com"
              autocomplete="email"
            />
            @if (isFieldInvalid('email')) {
              <span class="form-error">
                @if (loginForm.get('email')?.errors?.['required']) {
                  Email is required.
                } @else if (loginForm.get('email')?.errors?.['email']) {
                  Please enter a valid email address.
                }
              </span>
            }
          </div>

          <div class="form-group">
            <div class="password-label-row">
              <label class="form-label" for="login-password">
                Password <span class="required">*</span>
              </label>
              <a routerLink="/forgot-password" class="forgot-link">Forgot password?</a>
            </div>
            <div class="password-input-wrapper">
              <input
                id="login-password"
                [type]="showPassword ? 'text' : 'password'"
                class="form-control"
                [class.is-invalid]="isFieldInvalid('password')"
                formControlName="password"
                placeholder="Enter your password"
                autocomplete="current-password"
              />
              <button
                type="button"
                class="toggle-password-btn"
                (click)="showPassword = !showPassword"
                [attr.aria-label]="showPassword ? 'Hide password' : 'Show password'"
              >
                {{ showPassword ? 'Hide' : 'Show' }}
              </button>
            </div>
            @if (isFieldInvalid('password')) {
              <span class="form-error">Password is required.</span>
            }
          </div>

          <button
            type="submit"
            id="login-submit-btn"
            class="btn btn-primary auth-submit-btn"
            [disabled]="loading"
          >
            @if (loading) {
              Signing in...
            } @else {
              Sign in
            }
          </button>
        </form>

        <div class="auth-footer">
          <span>Don't have an account? </span>
          <a routerLink="/register">Sign up</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      min-height: 100dvh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--ground);
      padding: 24px;
    }

    .auth-card {
      width: 100%;
      max-width: 400px;
      background-color: var(--surface);
      border-radius: var(--radius-card);
      border: 1px solid var(--border);
      padding: 32px;
    }

    .auth-header {
      margin-bottom: 24px;
    }

    .auth-title {
      font-size: 22px;
      font-weight: 600;
      color: var(--text);
      letter-spacing: -0.01em;
      margin-bottom: 4px;
    }

    .auth-subtitle {
      font-size: 13.5px;
      color: var(--muted);
      line-height: 1.4;
    }

    .auth-alert {
      padding: 10px 12px;
      border-radius: var(--radius-control);
      margin-bottom: 18px;
      font-size: 12.5px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .error-alert {
      background-color: var(--pill-negative-bg);
      color: var(--negative);
      border: 1px solid var(--pill-negative-border);
    }

    .password-label-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .forgot-link {
      font-size: 12px;
      color: var(--muted);
    }

    .forgot-link:hover {
      color: var(--text);
    }

    .password-input-wrapper {
      position: relative;
    }

    .password-input-wrapper input {
      padding-right: 54px;
    }

    .toggle-password-btn {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 11.5px;
      font-weight: 500;
      color: var(--muted);
      padding: 3px 6px;
      border-radius: var(--radius-control);
    }

    .toggle-password-btn:hover {
      color: var(--text);
    }

    .auth-submit-btn {
      width: 100%;
      margin-top: 6px;
    }

    .auth-footer {
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid var(--border);
      text-align: center;
      font-size: 13px;
      color: var(--muted);
    }

    .auth-footer a {
      color: var(--text);
      font-weight: 500;
      text-decoration: underline;
      text-underline-offset: 3px;
    }

    .auth-footer a:hover {
      color: var(--accent);
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  showPassword = false;
  loading = false;
  errorMessage = '';

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  isFieldInvalid(field: string): boolean {
    const ctrl = this.loginForm.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.toastService.success('Welcome back to CareerFlow.');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 0) {
          this.errorMessage = 'Unable to sign in. Check your connection and try again.';
        } else {
          this.errorMessage = err.error?.message || 'Email or password is incorrect.';
        }
      }
    });
  }
}

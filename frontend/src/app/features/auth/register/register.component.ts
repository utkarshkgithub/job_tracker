import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-wrapper">
      <div class="auth-card">
        <div class="auth-header">
          <h1 class="auth-title">CareerFlow</h1>
          <p class="auth-subtitle">Create an account to track applications and interviews</p>
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

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" novalidate>
          <div class="form-group">
            <label class="form-label" for="reg-name">
              Full name <span class="required">*</span>
            </label>
            <input
              id="reg-name"
              type="text"
              class="form-control"
              [class.is-invalid]="isFieldInvalid('fullName')"
              formControlName="fullName"
              placeholder="e.g. Jordan Lee"
              autocomplete="name"
            />
            @if (isFieldInvalid('fullName')) {
              <span class="form-error">Full name is required.</span>
            }
          </div>

          <div class="form-group">
            <label class="form-label" for="reg-email">
              Email <span class="required">*</span>
            </label>
            <input
              id="reg-email"
              type="email"
              class="form-control"
              [class.is-invalid]="isFieldInvalid('email')"
              formControlName="email"
              placeholder="you@domain.com"
              autocomplete="email"
            />
            @if (isFieldInvalid('email')) {
              <span class="form-error">
                @if (registerForm.get('email')?.errors?.['required']) {
                  Email address is required.
                } @else if (registerForm.get('email')?.errors?.['email']) {
                  Please enter a valid email address.
                }
              </span>
            }
          </div>

          <div class="form-group">
            <label class="form-label" for="reg-password">
              Password <span class="required">*</span>
            </label>
            <div class="password-input-wrapper">
              <input
                id="reg-password"
                [type]="showPassword ? 'text' : 'password'"
                class="form-control"
                [class.is-invalid]="isFieldInvalid('password')"
                formControlName="password"
                placeholder="At least 6 characters"
                autocomplete="new-password"
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
              <span class="form-error">Password must be at least 6 characters.</span>
            }
          </div>

          <button
            type="submit"
            id="register-submit-btn"
            class="btn btn-primary auth-submit-btn"
            [disabled]="loading"
          >
            @if (loading) {
              Creating account...
            } @else {
              Create account
            }
          </button>
        </form>

        <div class="auth-footer">
          <span>Already registered? </span>
          <a routerLink="/login">Sign in</a>
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
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  showPassword = false;
  loading = false;
  errorMessage = '';

  registerForm: FormGroup = this.fb.group({
    fullName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  isFieldInvalid(field: string): boolean {
    const ctrl = this.registerForm.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.toastService.success('Account created successfully.');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 0) {
          this.errorMessage = 'Unable to connect to server. Please try again.';
        } else {
          this.errorMessage = err.error?.message || 'Registration failed. Please check your information.';
        }
      }
    });
  }
}

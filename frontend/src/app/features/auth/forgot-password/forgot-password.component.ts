import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-wrapper">
      <div class="auth-card">
        <div class="auth-header">
          <h1 class="auth-title">CareerFlow</h1>
          <p class="auth-subtitle">Reset your account password</p>
        </div>

        @if (submittedMessage) {
          <div class="confirmation-box">
            <h2 class="confirmation-title">Check your inbox</h2>
            <p class="confirmation-text">{{ submittedMessage }}</p>
            <a routerLink="/login" class="btn btn-primary back-login-btn">Back to sign in</a>
          </div>
        } @else {
          <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()" novalidate>
            <div class="form-group">
              <label class="form-label" for="reset-email">
                Registered email <span class="required">*</span>
              </label>
              <input
                id="reset-email"
                type="email"
                class="form-control"
                [class.is-invalid]="isFieldInvalid('email')"
                formControlName="email"
                placeholder="you@domain.com"
                autocomplete="email"
              />
              @if (isFieldInvalid('email')) {
                <span class="form-error">
                  @if (forgotForm.get('email')?.errors?.['required']) {
                    Email address is required.
                  } @else if (forgotForm.get('email')?.errors?.['email']) {
                    Please enter a valid email address.
                  }
                </span>
              }
            </div>

            <button
              type="submit"
              id="reset-submit-btn"
              class="btn btn-primary auth-submit-btn"
              [disabled]="loading"
            >
              @if (loading) {
                Sending link...
              } @else {
                Send reset link
              }
            </button>
          </form>

          <div class="auth-footer">
            <a routerLink="/login">← Back to sign in</a>
          </div>
        }
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

    .confirmation-box {
      text-align: center;
      padding: 12px 0;
    }

    .confirmation-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 8px;
    }

    .confirmation-text {
      font-size: 13px;
      color: var(--muted);
      line-height: 1.5;
      margin-bottom: 20px;
    }

    .back-login-btn {
      width: 100%;
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
    }

    .auth-footer a {
      color: var(--muted);
      font-weight: 500;
    }

    .auth-footer a:hover {
      color: var(--text);
    }
  `]
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  loading = false;
  submittedMessage = '';

  forgotForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  isFieldInvalid(field: string): boolean {
    const ctrl = this.forgotForm.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  onSubmit() {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.authService.forgotPassword(this.forgotForm.value.email).subscribe({
      next: (res) => {
        this.loading = false;
        this.submittedMessage = res.message;
      },
      error: () => {
        this.loading = false;
        this.submittedMessage = 'If that email address is registered, instructions to reset your password have been sent.';
      }
    });
  }
}

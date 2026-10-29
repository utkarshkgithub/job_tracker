import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HeaderComponent],
  template: `
    <app-header title="Settings" subtitle="Manage your personal profile, credentials, and preferences."></app-header>

    <div class="settings-container">
      <!-- Settings Tabs -->
      <div class="settings-nav-tabs">
        <a routerLink="/settings/profile" routerLinkActive="active" class="settings-tab-btn">
          Profile & Security
        </a>
        <a routerLink="/settings/preferences" routerLinkActive="active" class="settings-tab-btn">
          Preferences
        </a>
      </div>

      <div class="settings-card card">
        <div class="settings-section-header">
          <h3 class="section-title">Profile Information</h3>
          <p class="section-subtitle">Update your display name and view account details</p>
        </div>

        <form [formGroup]="profileForm" (ngSubmit)="onSaveProfile()" novalidate>
          <div class="form-group">
            <label class="form-label" for="profile-name">
              Full name <span class="required">*</span>
            </label>
            <input
              id="profile-name"
              type="text"
              class="form-control"
              [class.is-invalid]="isFieldInvalid(profileForm, 'fullName')"
              formControlName="fullName"
            />
            @if (isFieldInvalid(profileForm, 'fullName')) {
              <span class="form-error">Full name is required.</span>
            }
          </div>

          <div class="form-group">
            <label class="form-label" for="profile-email">
              Account Email
            </label>
            <input
              id="profile-email"
              type="email"
              class="form-control disabled-input"
              [value]="userEmail"
              disabled
            />
            <span class="form-hint">Email address is tied to your account login.</span>
          </div>

          <div class="settings-actions-row">
            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="savingProfile || profileForm.pristine || profileForm.invalid"
            >
              @if (savingProfile) {
                <span class="spinner"></span>
                Saving...
              } @else {
                Save Changes
              }
            </button>
          </div>
        </form>

        <div class="settings-divider"></div>

        <!-- Security: Change Password -->
        <div class="settings-section-header">
          <h3 class="section-title">Security & Password</h3>
          <p class="section-subtitle">Ensure your account is protected with a secure password</p>
        </div>

        <form [formGroup]="passwordForm" (ngSubmit)="onChangePassword()" novalidate>
          <div class="form-group">
            <label class="form-label" for="current-password">
              Current password <span class="required">*</span>
            </label>
            <input
              id="current-password"
              type="password"
              class="form-control"
              [class.is-invalid]="isFieldInvalid(passwordForm, 'currentPassword')"
              formControlName="currentPassword"
              placeholder="Enter current password"
            />
            @if (isFieldInvalid(passwordForm, 'currentPassword')) {
              <span class="form-error">Current password is required.</span>
            }
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label" for="new-password">
                New password <span class="required">*</span>
              </label>
              <input
                id="new-password"
                type="password"
                class="form-control"
                [class.is-invalid]="isFieldInvalid(passwordForm, 'newPassword')"
                formControlName="newPassword"
                placeholder="At least 6 characters"
              />
              @if (isFieldInvalid(passwordForm, 'newPassword')) {
                <span class="form-error">New password must be at least 6 characters.</span>
              }
            </div>

            <div class="form-group">
              <label class="form-label" for="confirm-password">
                Confirm new password <span class="required">*</span>
              </label>
              <input
                id="confirm-password"
                type="password"
                class="form-control"
                [class.is-invalid]="isFieldInvalid(passwordForm, 'confirmNewPassword')"
                formControlName="confirmNewPassword"
                placeholder="Repeat new password"
              />
              @if (isFieldInvalid(passwordForm, 'confirmNewPassword')) {
                <span class="form-error">Passwords must match.</span>
              }
            </div>
          </div>

          <div class="settings-actions-row">
            <button
              type="submit"
              class="btn btn-secondary"
              [disabled]="savingPassword || passwordForm.invalid"
            >
              @if (savingPassword) {
                <span class="spinner"></span>
                Updating Password...
              } @else {
                Update Password
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .settings-container {
      padding: 32px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-width: 800px;
      width: 100%;
    }

    .settings-nav-tabs {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .settings-tab-btn {
      padding: 7px 16px;
      border-radius: var(--radius-control);
      font-size: 13px;
      font-weight: 500;
      color: var(--muted);
      background-color: var(--surface);
      border: 1px solid var(--border);
      text-decoration: none;
      transition: all var(--transition-fast);
      cursor: pointer;
    }

    .settings-tab-btn:hover {
      background-color: var(--raised);
      color: var(--text);
      border-color: var(--control);
      text-decoration: none;
    }

    .settings-tab-btn.active {
      background-color: var(--active);
      color: var(--text);
      border-color: var(--border);
      font-weight: 600;
    }

    .settings-card {
      padding: 32px;
    }

    .settings-section-header {
      margin-bottom: 20px;
    }

    .section-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-main);
    }

    .section-subtitle {
      font-size: 13px;
      color: var(--text-secondary);
      margin-top: 2px;
    }

    .disabled-input {
      background-color: var(--bg-app);
      opacity: 0.8;
      cursor: not-allowed;
    }

    .settings-divider {
      height: 1px;
      background-color: var(--border-light);
      margin: 32px 0 28px;
    }

    .form-row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .settings-actions-row {
      display: flex;
      justify-content: flex-end;
      margin-top: 14px;
    }

    .spinner {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255, 255, 255, 0.4);
      border-top-color: #ffffff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      display: inline-block;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 600px) {
      .settings-container {
        padding: 20px 16px;
      }
      .settings-card {
        padding: 24px 18px;
      }
      .form-row-2 {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProfileSettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  savingProfile = false;
  savingPassword = false;

  profileForm: FormGroup = this.fb.group({
    fullName: ['', [Validators.required, Validators.maxLength(100)]]
  });

  passwordForm: FormGroup = this.fb.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmNewPassword: ['', [Validators.required]]
  });

  get userEmail(): string {
    return this.authService.currentUser()?.email || '';
  }

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.profileForm.patchValue({
        fullName: user.fullName
      });
      this.profileForm.markAsPristine();
    }
  }

  isFieldInvalid(form: FormGroup, field: string): boolean {
    const ctrl = form.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  onSaveProfile(): void {
    if (this.profileForm.invalid) return;

    this.savingProfile = true;
    this.authService.updateProfile(this.profileForm.value).subscribe({
      next: (res) => {
        this.savingProfile = false;
        this.profileForm.markAsPristine();
        this.toastService.success(res.message || 'Profile updated successfully.');
      },
      error: (err) => {
        this.savingProfile = false;
        this.toastService.error(err.error?.message || 'Failed to update profile.');
      }
    });
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword, confirmNewPassword } = this.passwordForm.value;
    if (newPassword !== confirmNewPassword) {
      this.toastService.error('New password and confirmation do not match.');
      return;
    }

    this.savingPassword = true;
    this.authService.changePassword({ currentPassword, newPassword, confirmNewPassword }).subscribe({
      next: (res) => {
        this.savingPassword = false;
        this.passwordForm.reset();
        this.toastService.success(res.message || 'Password changed successfully.');
      },
      error: (err) => {
        this.savingPassword = false;
        this.toastService.error(err.error?.message || 'Failed to update password.');
      }
    });
  }
}

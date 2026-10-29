import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { UpdatePreferencesRequest } from '../../../core/models/user.model';

@Component({
  selector: 'app-preferences',
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
          <h3 class="section-title">Display & Regional Preferences</h3>
          <p class="section-subtitle">Customize theme appearance, date, and time displays</p>
        </div>

        <form [formGroup]="prefForm" (ngSubmit)="onSave()" novalidate>
          <!-- Theme Selection -->
          <div class="form-group">
            <label class="form-label">Theme Mode</label>
            <div class="theme-options-grid">
              <label class="theme-option-box" [class.selected]="selectedTheme === 'light'">
                <input type="radio" value="light" formControlName="theme" (change)="onThemeChange('light')" />
                <div class="theme-icon">☀️</div>
                <div class="theme-title">Light</div>
                <span class="theme-desc">Crisp white interface</span>
              </label>

              <label class="theme-option-box" [class.selected]="selectedTheme === 'dark'">
                <input type="radio" value="dark" formControlName="theme" (change)="onThemeChange('dark')" />
                <div class="theme-icon">🌙</div>
                <div class="theme-title">Dark</div>
                <span class="theme-desc">High contrast dark theme</span>
              </label>

              <label class="theme-option-box" [class.selected]="selectedTheme === 'system'">
                <input type="radio" value="system" formControlName="theme" (change)="onThemeChange('system')" />
                <div class="theme-icon">💻</div>
                <div class="theme-title">System</div>
                <span class="theme-desc">Match OS preferences</span>
              </label>
            </div>
          </div>

          <div class="form-row-2">
            <!-- Date Format -->
            <div class="form-group">
              <label class="form-label" for="date-format-select">Date Format</label>
              <select id="date-format-select" class="form-control" formControlName="dateFormat">
                <option value="DD MMM YYYY">DD MMM YYYY (e.g. 31 Oct 2026)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-10-31)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 10/31/2026)</option>
              </select>
            </div>

            <!-- Time Format -->
            <div class="form-group">
              <label class="form-label" for="time-format-select">Time Display</label>
              <select id="time-format-select" class="form-control" formControlName="timeFormat">
                <option value="12-hour">12-hour (e.g. 02:00 PM)</option>
                <option value="24-hour">24-hour (e.g. 14:00)</option>
              </select>
            </div>
          </div>

          <!-- Timezone -->
          <div class="form-group">
            <label class="form-label" for="timezone-select">Preferred Timezone</label>
            <select id="timezone-select" class="form-control" formControlName="timeZoneId">
              <option value="UTC">UTC (Universal Coordinated Time)</option>
              <option value="America/New_York">Eastern Time (US & Canada)</option>
              <option value="America/Chicago">Central Time (US & Canada)</option>
              <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
              <option value="Europe/London">London / Greenwich Mean Time</option>
              <option value="Europe/Berlin">Central European Time (Berlin, Paris)</option>
              <option value="Asia/Tokyo">Tokyo / Japan Standard Time</option>
              <option value="Asia/Kolkata">India Standard Time (IST)</option>
            </select>
            <span class="form-hint">Interview times will be displayed with this regional reference.</span>
          </div>

          <div class="settings-actions-row">
            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="saving"
            >
              @if (saving) {
                <span class="spinner"></span>
                Saving Preferences...
              } @else {
                Save Preferences
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
      margin-bottom: 24px;
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

    .theme-options-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
      margin-top: 6px;
    }

    .theme-option-box {
      border: 2px solid var(--border-main);
      border-radius: var(--radius-md);
      padding: 16px;
      text-align: center;
      cursor: pointer;
      background-color: var(--bg-app);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      position: relative;
      transition: all var(--transition-fast);
    }

    .theme-option-box input {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
    }

    .theme-option-box:hover {
      border-color: var(--border-strong);
      background-color: var(--bg-surface-hover);
    }

    .theme-option-box.selected {
      border-color: var(--primary);
      background-color: var(--primary-light);
    }

    .theme-icon {
      font-size: 24px;
      margin-bottom: 4px;
    }

    .theme-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-main);
    }

    .theme-desc {
      font-size: 11.5px;
      color: var(--text-muted);
    }

    .form-row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .settings-actions-row {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
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
      .theme-options-grid, .form-row-2 {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PreferencesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  saving = false;

  prefForm: FormGroup = this.fb.group({
    theme: ['system', [Validators.required]],
    dateFormat: ['DD MMM YYYY', [Validators.required]],
    timeFormat: ['12-hour', [Validators.required]],
    timeZoneId: ['UTC', [Validators.required]]
  });

  get selectedTheme(): string {
    return this.prefForm.get('theme')?.value || 'system';
  }

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.prefForm.patchValue({
        theme: user.theme || 'system',
        dateFormat: user.dateFormat || 'DD MMM YYYY',
        timeFormat: user.timeFormat || '12-hour',
        timeZoneId: user.timeZoneId || 'UTC'
      });
    }
  }

  onThemeChange(theme: 'light' | 'dark' | 'system'): void {
    this.prefForm.patchValue({ theme });
    this.authService.applyTheme(theme);
  }

  onSave(): void {
    if (this.prefForm.invalid) return;

    this.saving = true;
    const req: UpdatePreferencesRequest = this.prefForm.value;

    this.authService.updatePreferences(req).subscribe({
      next: (res) => {
        this.saving = false;
        this.toastService.success(res.message || 'Preferences saved successfully.');
      },
      error: (err) => {
        this.saving = false;
        this.toastService.error(err.error?.message || 'Failed to save preferences.');
      }
    });
  }
}

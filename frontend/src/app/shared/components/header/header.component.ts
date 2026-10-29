import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UiService } from '../../../core/services/ui.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="app-header">
      <div class="header-left">
        <button
          type="button"
          class="menu-toggle-btn"
          (click)="onToggleMenu()"
          aria-label="Toggle navigation menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        <div class="header-titles">
          <h1 class="page-title">{{ title }}</h1>
          @if (subtitle) {
            <p class="page-subtitle">{{ subtitle }}</p>
          }
        </div>
      </div>

      <div class="header-right">
        <!-- Quick Theme Toggle -->
        <button
          type="button"
          class="btn-icon theme-toggle"
          (click)="toggleTheme()"
          [attr.aria-label]="isDark() ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          @if (isDark()) {
            <svg class="theme-icon icon-sun" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          } @else {
            <svg class="theme-icon icon-moon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          }
        </button>

        <!-- Optional Primary Action Slot -->
        <div class="actions-slot">
          <ng-content select="[header-actions]"></ng-content>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .app-header {
      height: 56px;
      padding: 0 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--border);
      background-color: var(--surface);
      position: sticky;
      top: 0;
      z-index: 50;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }

    .menu-toggle-btn {
      display: none;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      padding: 0;
      border-radius: var(--radius-control);
      border: 1px solid var(--border);
      background-color: var(--surface);
      color: var(--muted);
      cursor: pointer;
      flex-shrink: 0;
      transition: background-color var(--transition-fast), color var(--transition-fast);
    }

    .menu-toggle-btn:hover {
      background-color: var(--raised);
      color: var(--text);
    }

    .header-titles {
      min-width: 0;
      display: flex;
      flex-direction: column;
    }

    .page-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--text);
      letter-spacing: -0.015em;
      line-height: 1.2;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin: 0;
    }

    .page-subtitle {
      font-size: 12px;
      color: var(--muted);
      line-height: 1.2;
      margin-top: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
    }

    .btn-icon.theme-toggle {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-control);
      border: 1px solid var(--border);
      background-color: var(--surface);
      color: var(--muted);
      cursor: pointer;
      padding: 0;
      transition: background-color var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
    }

    .btn-icon.theme-toggle:hover {
      background-color: var(--raised);
      color: var(--text);
      border-color: var(--control);
    }

    .theme-icon {
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .btn-icon.theme-toggle:hover .theme-icon {
      transform: rotate(15deg);
    }

    .actions-slot {
      display: flex;
      align-items: center;
    }

    /* Fix responsive button truncation inside header-actions */
    ::ng-deep [header-actions] {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    @media (max-width: 900px) {
      .app-header {
        padding: 0 14px;
      }

      .menu-toggle-btn {
        display: flex;
      }

      .page-subtitle {
        display: none;
      }

      .page-title {
        font-size: 16px;
      }
    }

    @media (max-width: 600px) {
      .app-header {
        padding: 0 12px;
      }

      ::ng-deep [header-actions] .btn {
        padding: 6px 10px !important;
        font-size: 12px !important;
        white-space: nowrap !important;
        gap: 4px !important;
      }
    }
  `]
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private uiService = inject(UiService);

  @Input() title = 'Overview';
  @Input() subtitle = '';
  @Output() toggleSidebar = new EventEmitter<void>();

  isDark = signal(
    this.authService.currentUser()?.theme === 'dark' ||
    document.documentElement.getAttribute('data-theme') === 'dark'
  );

  onToggleMenu() {
    this.uiService.toggleMobileSidebar();
    this.toggleSidebar.emit();
  }

  toggleTheme() {
    const nextDark = !this.isDark();
    this.isDark.set(nextDark);
    const theme = nextDark ? 'dark' : 'light';
    this.authService.applyTheme(theme);
  }
}

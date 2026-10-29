import { Component, EventEmitter, HostListener, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Mobile Backdrop -->
    @if (isOpen) {
      <div class="sidebar-backdrop" (click)="closeSidebar.emit()"></div>
    }

    <aside class="sidebar" [class.open]="isOpen">
      <!-- Logo Section -->
      <div class="sidebar-header">
        <a routerLink="/dashboard" class="logo-link" (click)="closeSidebar.emit()">
          <span class="logo-mark">C</span>
          <span class="logo-text">CareerFlow</span>
        </a>
        <button class="mobile-close-btn" (click)="closeSidebar.emit()" aria-label="Close navigation">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Main Navigation -->
      <nav class="sidebar-nav">
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-item" (click)="closeSidebar.emit()">
          <span class="nav-icon">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="7" height="9" x="3" y="3" rx="1"></rect>
              <rect width="7" height="5" x="14" y="3" rx="1"></rect>
              <rect width="7" height="9" x="14" y="12" rx="1"></rect>
              <rect width="7" height="5" x="3" y="16" rx="1"></rect>
            </svg>
          </span>
          <span class="nav-label">Overview</span>
        </a>

        <a routerLink="/applications" routerLinkActive="active" class="nav-item" (click)="closeSidebar.emit()">
          <span class="nav-icon">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
          </span>
          <span class="nav-label">Applications</span>
        </a>

        <a routerLink="/interviews" routerLinkActive="active" class="nav-item" (click)="closeSidebar.emit()">
          <span class="nav-icon">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </span>
          <span class="nav-label">Interviews</span>
        </a>

        <a routerLink="/analytics" routerLinkActive="active" class="nav-item" (click)="closeSidebar.emit()">
          <span class="nav-icon">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 3v18h18"></path>
              <path d="m19 9-5 5-4-4-3 3"></path>
            </svg>
          </span>
          <span class="nav-label">Analytics</span>
        </a>
      </nav>

      <!-- Bottom Nav Section -->
      <div class="sidebar-footer">
        <a routerLink="/settings/profile" routerLinkActive="active" class="nav-item" (click)="closeSidebar.emit()">
          <span class="nav-icon">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </span>
          <span class="nav-label">Settings</span>
        </a>

        <button type="button" class="nav-item help-btn" (click)="openHelp.emit()">
          <span class="nav-icon">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </span>
          <span class="nav-label">Help</span>
        </button>

        <!-- User Profile Dropdown Area -->
        <div class="user-menu-wrapper">
          <button type="button" class="user-card-btn" (click)="toggleDropdown($event)" aria-expanded="isDropdownOpen">
            <div class="user-avatar num">{{ userInitials }}</div>
            <div class="user-info">
              <span class="user-name">{{ userName }}</span>
              <span class="user-email">{{ userEmail }}</span>
            </div>
            <span class="menu-chevron">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </span>
          </button>

          @if (isDropdownOpen) {
            <div class="user-dropdown">
              <a routerLink="/settings/profile" class="dropdown-item" (click)="closeDropdown(); closeSidebar.emit()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Profile
              </a>
              <a routerLink="/settings/preferences" class="dropdown-item" (click)="closeDropdown(); closeSidebar.emit()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
                Preferences
              </a>
              <div class="dropdown-divider"></div>
              <button type="button" class="dropdown-item signout-item" (click)="onSignOut()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Sign out
              </button>
            </div>
          }
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 230px;
      height: 100dvh;
      position: fixed;
      top: 0;
      left: 0;
      background-color: var(--ground);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      z-index: 100;
      transition: transform 0.2s ease;
    }

    .sidebar-header {
      height: 56px;
      padding: 0 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--border);
    }

    .logo-link {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: var(--text);
    }

    .logo-mark {
      width: 26px;
      height: 26px;
      background-color: var(--primary);
      color: var(--primary-ink);
      border-radius: var(--radius-control);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 13.5px;
      line-height: 1;
    }

    .logo-text {
      font-weight: 600;
      font-size: 15px;
      letter-spacing: -0.01em;
      color: var(--text);
    }

    .mobile-close-btn {
      display: none;
      color: var(--muted);
      padding: 4px;
      border-radius: var(--radius-sm);
    }

    .sidebar-nav {
      flex: 1;
      padding: 12px 10px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      overflow-y: auto;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      border-radius: var(--radius-control);
      color: var(--muted);
      font-weight: 450;
      font-size: 13.5px;
      transition: background-color var(--transition-fast), color var(--transition-fast);
      text-decoration: none;
    }

    .nav-item:hover {
      background-color: var(--raised);
      color: var(--text);
      text-decoration: none;
    }

    .nav-item.active {
      background-color: var(--active);
      color: var(--text);
      font-weight: 500;
    }

    .nav-icon {
      display: flex;
      align-items: center;
      color: inherit;
    }

    .help-btn {
      width: 100%;
      text-align: left;
    }

    .sidebar-footer {
      padding: 10px;
      border-top: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .user-menu-wrapper {
      position: relative;
      margin-top: 6px;
      padding-top: 8px;
      border-top: 1px solid var(--border);
    }

    .user-card-btn {
      width: 100%;
      padding: 6px 8px;
      border-radius: var(--radius-control);
      display: flex;
      align-items: center;
      gap: 8px;
      background-color: transparent;
      border: 1px solid transparent;
      text-align: left;
      transition: background-color var(--transition-fast), border-color var(--transition-fast);
    }

    .user-card-btn:hover {
      background-color: var(--raised);
      border-color: var(--border);
    }

    .user-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background-color: var(--raised);
      border: 1px solid var(--border);
      color: var(--text);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 11.5px;
      flex-shrink: 0;
    }

    .user-info {
      flex: 1;
      min-width: 0;
    }

    .user-name {
      display: block;
      font-size: 12.5px;
      font-weight: 500;
      color: var(--text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-email {
      display: block;
      font-size: 11px;
      color: var(--muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .menu-chevron {
      color: var(--muted);
      display: flex;
    }

    .user-dropdown {
      position: absolute;
      bottom: calc(100% + 6px);
      left: 0;
      right: 0;
      background-color: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-control);
      box-shadow: var(--shadow-overlay);
      padding: 4px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      z-index: 10;
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 7px 10px;
      border-radius: var(--radius-chip);
      font-size: 12.5px;
      color: var(--text);
      text-decoration: none;
      transition: background-color var(--transition-fast);
    }

    .dropdown-item:hover {
      background-color: var(--raised);
    }

    .dropdown-divider {
      height: 1px;
      background-color: var(--border);
      margin: 3px 0;
    }

    .signout-item {
      width: 100%;
      color: var(--negative);
    }

    .signout-item:hover {
      background-color: var(--pill-negative-bg);
    }

    /* Mobile Drawer */
    .sidebar-backdrop {
      position: fixed;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.45);
      z-index: 99;
    }

    @media (max-width: 900px) {
      .sidebar {
        transform: translateX(-100%);
      }
      .sidebar.open {
        transform: translateX(0);
      }
      .mobile-close-btn {
        display: flex;
      }
    }
  `]
})
export class SidebarComponent {
  private authService = inject(AuthService);

  @Input() isOpen = false;
  @Output() closeSidebar = new EventEmitter<void>();
  @Output() openHelp = new EventEmitter<void>();

  isDropdownOpen = false;

  get currentUser() {
    return this.authService.currentUser();
  }

  get userName(): string {
    return this.currentUser?.fullName || 'User';
  }

  get userEmail(): string {
    return this.currentUser?.email || '';
  }

  get userInitials(): string {
    const name = this.userName.trim();
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }

  onSignOut() {
    this.closeDropdown();
    this.authService.logout();
  }

  @HostListener('document:click')
  onDocumentClick() {
    if (this.isDropdownOpen) {
      this.closeDropdown();
    }
  }
}

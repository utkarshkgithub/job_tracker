import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ApplicationService } from '../../../core/services/application.service';
import { ApplicationFilter, JobApplication, PagedResult } from '../../../core/models/application.model';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-application-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent, StatusBadgeComponent, ConfirmDialogComponent],
  template: `
    <app-header title="Applications" subtitle="Track and manage your job applications.">
      <div header-actions>
        <a routerLink="/applications/new" class="btn btn-primary" id="add-app-header-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Application
        </a>
      </div>
    </app-header>

    <div class="applications-container">
      <!-- Section B: Search Bar -->
      <div class="search-filter-card">
        <div class="search-input-wrapper">
          <span class="search-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
          <input
            type="text"
            class="search-input"
            id="applications-search-input"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange()"
            placeholder="Search company or job title..."
          />
          @if (searchQuery) {
            <button type="button" class="clear-search-btn" (click)="clearSearch()" aria-label="Clear search">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          }
        </div>

        <!-- Section C: Status Tabs -->
        <div class="status-tabs-row">
          <button
            type="button"
            class="tab-btn"
            [class.active]="selectedStatusTab === null"
            (click)="selectStatusTab(null)"
          >
            All
          </button>
          @for (tab of statusTabs; track tab.id) {
            <button
              type="button"
              class="tab-btn"
              [class.active]="selectedStatusTab === tab.id"
              (click)="selectStatusTab(tab.id)"
            >
              {{ tab.label }}
            </button>
          }
        </div>

        <!-- Section D: Secondary Filters & Sort Controls -->
        <div class="filters-toolbar">
          <div class="filter-controls-group">
            <!-- Date Filter Dropdown -->
            <div class="filter-select-wrapper">
              <label for="filter-date" class="sr-only">Date filter</label>
              <select id="filter-date" class="filter-select" [(ngModel)]="dateFilter" (change)="onFilterChange()">
                <option value="all">All time</option>
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
                <option value="90days">Last 90 days</option>
              </select>
            </div>

            <!-- Sort Dropdown -->
            <div class="filter-select-wrapper">
              <label for="filter-sort" class="sr-only">Sort by</label>
              <select id="filter-sort" class="filter-select" [(ngModel)]="sortBy" (change)="onFilterChange()">
                <option value="recent_updated">Recently updated</option>
                <option value="newest">Newest applications</option>
                <option value="oldest">Oldest applications</option>
                <option value="company_asc">Company name A–Z</option>
              </select>
            </div>

            @if (hasActiveFilters) {
              <button type="button" class="btn btn-secondary btn-sm" (click)="resetFilters()">
                Reset filters
              </button>
            }
          </div>

          <div class="page-size-selector">
            <span class="page-size-label">Show:</span>
            <select class="filter-select-sm" [(ngModel)]="pageSize" (change)="onPageSizeChange()">
              <option [ngValue]="10">10</option>
              <option [ngValue]="25">25</option>
              <option [ngValue]="50">50</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Section E: Applications Table / Grid -->
      @if (loading) {
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Position</th>
                <th>Status</th>
                <th>Applied</th>
                <th>Next Interview</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (i of [1, 2, 3, 4, 5]; track i) {
                <tr>
                  <td><div class="skeleton" style="width: 120px; height: 16px;"></div></td>
                  <td><div class="skeleton" style="width: 150px; height: 16px;"></div></td>
                  <td><div class="skeleton" style="width: 75px; height: 22px;"></div></td>
                  <td><div class="skeleton" style="width: 90px; height: 14px;"></div></td>
                  <td><div class="skeleton" style="width: 100px; height: 14px;"></div></td>
                  <td><div class="skeleton" style="width: 90px; height: 14px;"></div></td>
                  <td><div class="skeleton" style="width: 24px; height: 24px;"></div></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      } @else if (error) {
        <div class="card empty-state-box">
          <p class="error-msg">{{ error }}</p>
          <button type="button" class="btn btn-secondary" (click)="loadApplications()">Retry</button>
        </div>
      } @else if (!pagedResult || pagedResult.items.length === 0) {
        <!-- Empty States -->
        <div class="card empty-state-box">
          @if (searchQuery || selectedStatusTab !== null || dateFilter !== 'all') {
            <div class="empty-icon-sm">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <h3 class="empty-title-sm">No applications match your filters</h3>
            <p class="empty-desc-sm">Try adjusting your search query, status tab, or date range.</p>
            <button type="button" class="btn btn-secondary" (click)="resetFilters()">Clear Filters</button>
          } @else {
            <div class="empty-icon-sm">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <rect width="20" height="14" x="2" y="7" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </div>
            <h3 class="empty-title-sm">No applications yet</h3>
            <p class="empty-desc-sm">Record your first job application to start tracking interview dates and outcomes.</p>
            <a routerLink="/applications/new" class="btn btn-primary">Add your first application</a>
          }
        </div>
      } @else {
        <div class="table-container">
          <table class="table" id="applications-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Position</th>
                <th>Status</th>
                <th>Applied Date</th>
                <th>Next Interview</th>
                <th>Updated</th>
                <th style="width: 80px; text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (app of pagedResult.items; track app.id) {
                <tr class="app-row" (click)="openDetail(app.id)">
                  <td>
                    <div class="company-name-cell">
                      <div class="company-avatar">{{ app.companyName.substring(0, 1).toUpperCase() }}</div>
                      <span class="company-name-text">{{ app.companyName }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="position-title-text">{{ app.jobTitle }}</span>
                    @if (app.jobPostingUrl) {
                      <a
                        [href]="app.jobPostingUrl"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="posting-link"
                        (click)="$event.stopPropagation()"
                        title="Open job posting"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                          <polyline points="15 3 21 3 21 9"></polyline>
                          <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                      </a>
                    }
                  </td>
                  <td (click)="$event.stopPropagation()">
                    <div class="status-cell-wrapper">
                      <app-status-badge [status]="app.status"></app-status-badge>
                    </div>
                  </td>
                  <td>
                    <span class="cell-date">{{ app.applicationDate | date:'MMM dd, yyyy' }}</span>
                  </td>
                  <td>
                    @if (app.nextInterviewDate) {
                      <div class="interview-chip">
                        <span class="chip-round">{{ app.nextInterviewRound }}</span>
                        <span class="chip-time">{{ app.nextInterviewDate | date:'MMM dd, h:mm a' }}</span>
                      </div>
                    } @else {
                      <span class="text-muted-cell">—</span>
                    }
                  </td>
                  <td>
                    <span class="cell-date text-muted-cell">{{ app.updatedAt | date:'MMM dd' }}</span>
                  </td>
                  <td style="text-align: right;" (click)="$event.stopPropagation()">
                    <div class="action-menu-container">
                      <button
                        type="button"
                        class="btn-icon action-trigger-btn"
                        (click)="toggleMenu(app.id, $event)"
                        aria-label="Actions"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <circle cx="12" cy="12" r="1"></circle>
                          <circle cx="12" cy="5" r="1"></circle>
                          <circle cx="12" cy="19" r="1"></circle>
                        </svg>
                      </button>

                      @if (activeMenuId === app.id) {
                        <div class="context-menu">
                          <a [routerLink]="['/applications', app.id]" class="menu-item">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            View details
                          </a>
                          <a [routerLink]="['/applications', app.id, 'edit']" class="menu-item">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                            Edit application
                          </a>
                          <div class="menu-divider"></div>
                          <button type="button" class="menu-item menu-item-danger" (click)="promptDelete(app)">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                            Delete
                          </button>
                        </div>
                      }
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Section F: Pagination -->
        <div class="pagination-bar">
          <div class="pagination-info">
            Showing {{ itemRangeStart }}–{{ itemRangeEnd }} of {{ pagedResult.totalCount }} applications
          </div>
          <div class="pagination-nav">
            <button
              type="button"
              class="btn btn-secondary btn-sm"
              [disabled]="!pagedResult.hasPrevious"
              (click)="goToPage(currentPage - 1)"
            >
              Previous
            </button>
            <div class="page-pills">
              @for (p of pagesList; track p) {
                <button
                  type="button"
                  class="page-pill-btn"
                  [class.active]="p === currentPage"
                  (click)="goToPage(p)"
                >
                  {{ p }}
                </button>
              }
            </div>
            <button
              type="button"
              class="btn btn-secondary btn-sm"
              [disabled]="!pagedResult.hasNext"
              (click)="goToPage(currentPage + 1)"
            >
              Next
            </button>
          </div>
        </div>
      }
    </div>

    <!-- Delete Confirmation Modal -->
    <app-confirm-dialog
      [isOpen]="isDeleteModalOpen"
      [title]="'Delete Application'"
      [message]="'Delete this application for ' + (appToDelete?.companyName || '') + ' (' + (appToDelete?.jobTitle || '') + ')?'"
      [subtext]="'This will permanently remove the application and its associated interview records.'"
      confirmText="Delete Application"
      cancelText="Cancel"
      [isDestructive]="true"
      [loading]="deleteLoading"
      (confirm)="confirmDelete()"
      (cancel)="isDeleteModalOpen = false; appToDelete = null"
    ></app-confirm-dialog>
  `,
  styles: [`
    .applications-container {
      padding: 32px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-width: 1400px;
      width: 100%;
    }

    .search-filter-card {
      background-color: var(--bg-surface);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-main);
      box-shadow: var(--shadow-sm);
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .search-input-wrapper {
      position: relative;
      width: 100%;
    }

    .search-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
      display: flex;
    }

    .search-input {
      width: 100%;
      padding: 11px 40px 11px 42px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-main);
      background-color: var(--bg-app);
      font-size: 14px;
      color: var(--text-main);
      transition: all var(--transition-fast);
    }

    .search-input:focus {
      outline: none;
      border-color: var(--border-focus);
      background-color: var(--bg-surface);
      box-shadow: 0 0 0 3px var(--primary-light);
    }

    .clear-search-btn {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
      padding: 4px;
      border-radius: 4px;
    }

    .clear-search-btn:hover {
      color: var(--text-main);
    }

    /* Status Tabs */
    .status-tabs-row {
      display: flex;
      align-items: center;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 2px;
    }

    .tab-btn {
      padding: 6px 14px;
      border-radius: var(--radius-control);
      font-size: 13px;
      font-weight: 500;
      color: var(--muted);
      background-color: var(--surface);
      border: 1px solid var(--border);
      transition: all var(--transition-fast);
      white-space: nowrap;
      cursor: pointer;
    }

    .tab-btn:hover {
      background-color: var(--raised);
      color: var(--text);
      border-color: var(--control);
    }

    .tab-btn.active {
      background-color: var(--active);
      color: var(--text);
      border-color: var(--border);
      font-weight: 600;
      box-shadow: none;
    }

    /* Filters Toolbar */
    .filters-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
      padding-top: 8px;
      border-top: 1px solid var(--border-light);
    }

    .filter-controls-group {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .filter-select {
      padding: 7px 12px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-main);
      background-color: var(--bg-surface);
      color: var(--text-main);
      font-size: 13px;
      cursor: pointer;
    }

    .filter-select:focus {
      outline: none;
      border-color: var(--border-focus);
    }

    .page-size-selector {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .page-size-label {
      font-size: 13px;
      color: var(--text-muted);
    }

    .filter-select-sm {
      padding: 5px 8px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-main);
      background-color: var(--bg-surface);
      font-size: 12.5px;
      color: var(--text-main);
    }

    /* Table Styles */
    .app-row {
      cursor: pointer;
      transition: background-color var(--transition-fast);
    }

    .company-name-cell {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .company-avatar {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-control);
      background-color: var(--raised);
      border: 1px solid var(--border);
      color: var(--text);
      font-weight: 700;
      font-size: 12.5px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .company-name-text {
      font-weight: 600;
      color: var(--text-main);
    }

    .position-title-text {
      color: var(--text-secondary);
      font-size: 14px;
    }

    .posting-link {
      display: inline-flex;
      align-items: center;
      margin-left: 6px;
      color: var(--text-muted);
    }

    .posting-link:hover {
      color: var(--primary);
    }

    .cell-date {
      font-size: 13.5px;
      white-space: nowrap;
    }

    .text-muted-cell {
      color: var(--text-muted);
    }

    .interview-chip {
      display: inline-flex;
      flex-direction: column;
      gap: 2px;
    }

    .chip-round {
      font-size: 12.5px;
      font-weight: 600;
      color: var(--text-main);
    }

    .chip-time {
      font-size: 11.5px;
      color: var(--primary);
    }

    /* Context Action Menu */
    .action-menu-container {
      position: relative;
      display: inline-block;
    }

    .action-trigger-btn {
      padding: 6px;
      border-radius: var(--radius-sm);
    }

    .context-menu {
      position: absolute;
      right: 0;
      top: calc(100% + 4px);
      width: 170px;
      background-color: var(--bg-surface);
      border: 1px solid var(--border-main);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      padding: 6px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      z-index: 50;
      animation: menu-pop 0.15s ease-out;
    }

    @keyframes menu-pop {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .menu-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 10px;
      border-radius: var(--radius-sm);
      font-size: 13px;
      color: var(--text-main);
      text-decoration: none;
      transition: background-color var(--transition-fast);
      text-align: left;
      width: 100%;
    }

    .menu-item:hover {
      background-color: var(--bg-surface-hover);
      text-decoration: none;
    }

    .menu-item-danger {
      color: #ef4444;
    }

    .menu-item-danger:hover {
      background-color: #fef2f2;
      color: #b91c1c;
    }

    .menu-divider {
      height: 1px;
      background-color: var(--border-light);
      margin: 4px 0;
    }

    /* Pagination */
    .pagination-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
      padding: 12px 4px;
    }

    .pagination-info {
      font-size: 13.5px;
      color: var(--text-secondary);
    }

    .pagination-nav {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .page-pills {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .page-pill-btn {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-secondary);
      background-color: var(--bg-surface);
      border: 1px solid var(--border-main);
      transition: all var(--transition-fast);
    }

    .page-pill-btn:hover {
      background-color: var(--bg-surface-hover);
      color: var(--text-main);
    }

    .page-pill-btn.active {
      background-color: var(--active);
      color: var(--text);
      border-color: var(--border);
      font-weight: 600;
    }

    /* Empty State Box */
    .empty-state-box {
      padding: 56px 20px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .empty-icon-sm {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background-color: var(--raised);
      border: 1px solid var(--border);
      color: var(--text);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 4px;
    }

    .empty-title-sm {
      font-size: 18px;
      font-weight: 700;
      color: var(--text-main);
    }

    .empty-desc-sm {
      font-size: 14px;
      color: var(--text-secondary);
      max-width: 420px;
      line-height: 1.4;
      margin-bottom: 6px;
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      border: 0;
    }

    @media (max-width: 768px) {
      .applications-container {
        padding: 20px 16px;
      }
    }
  `]
})
export class ApplicationListComponent implements OnInit {
  private applicationService = inject(ApplicationService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loading = true;
  error = '';
  pagedResult: PagedResult<JobApplication> | null = null;

  searchQuery = '';
  private searchTimeout: any;

  selectedStatusTab: number | null = null;
  dateFilter = 'all';
  sortBy = 'recent_updated';
  currentPage = 1;
  pageSize = 10;

  activeMenuId: number | null = null;

  isDeleteModalOpen = false;
  deleteLoading = false;
  appToDelete: JobApplication | null = null;

  statusTabs = [
    { id: 0, label: 'Applied' },
    { id: 1, label: 'Assessment' },
    { id: 2, label: 'Interview' },
    { id: 3, label: 'Offer' },
    { id: 4, label: 'Rejected' },
    { id: 5, label: 'Withdrawn' }
  ];

  get hasActiveFilters(): boolean {
    return !!this.searchQuery || this.selectedStatusTab !== null || this.dateFilter !== 'all' || this.sortBy !== 'recent_updated';
  }

  get itemRangeStart(): number {
    if (!this.pagedResult || this.pagedResult.totalCount === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get itemRangeEnd(): number {
    if (!this.pagedResult) return 0;
    return Math.min(this.currentPage * this.pageSize, this.pagedResult.totalCount);
  }

  get pagesList(): number[] {
    if (!this.pagedResult) return [];
    const total = this.pagedResult.totalPages;
    const current = this.currentPage;
    const pages: number[] = [];
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  ngOnInit(): void {
    // Read optional query params (e.g. from Dashboard click)
    this.route.queryParams.subscribe(params => {
      if (params['status']) {
        const statusMap: Record<string, number> = {
          'Applied': 0,
          'Assessment': 1,
          'Interview': 2,
          'Offer': 3,
          'Rejected': 4,
          'Withdrawn': 5
        };
        if (statusMap[params['status']] !== undefined) {
          this.selectedStatusTab = statusMap[params['status']];
        }
      }
      this.loadApplications();
    });
  }

  loadApplications(): void {
    this.loading = true;
    this.error = '';

    const filter: ApplicationFilter = {
      search: this.searchQuery.trim() || undefined,
      status: this.selectedStatusTab !== null ? this.selectedStatusTab : undefined,
      dateFilter: this.dateFilter,
      sortBy: this.sortBy,
      page: this.currentPage,
      pageSize: this.pageSize
    };

    this.applicationService.getApplications(filter).subscribe({
      next: (res) => {
        this.pagedResult = res;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load applications. Please check your connection and retry.';
        this.loading = false;
      }
    });
  }

  onSearchChange(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.loadApplications();
    }, 350);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.currentPage = 1;
    this.loadApplications();
  }

  selectStatusTab(statusId: number | null): void {
    this.selectedStatusTab = statusId;
    this.currentPage = 1;
    this.loadApplications();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadApplications();
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.loadApplications();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedStatusTab = null;
    this.dateFilter = 'all';
    this.sortBy = 'recent_updated';
    this.currentPage = 1;
    this.loadApplications();
  }

  goToPage(page: number): void {
    if (!this.pagedResult || page < 1 || page > this.pagedResult.totalPages) return;
    this.currentPage = page;
    this.loadApplications();
  }

  openDetail(id: number): void {
    this.router.navigate(['/applications', id]);
  }

  toggleMenu(id: number, event: MouseEvent): void {
    event.stopPropagation();
    this.activeMenuId = this.activeMenuId === id ? null : id;
  }

  promptDelete(app: JobApplication): void {
    this.activeMenuId = null;
    this.appToDelete = app;
    this.isDeleteModalOpen = true;
  }

  confirmDelete(): void {
    if (!this.appToDelete) return;

    this.deleteLoading = true;
    this.applicationService.delete(this.appToDelete.id).subscribe({
      next: (res) => {
        this.deleteLoading = false;
        this.isDeleteModalOpen = false;
        this.appToDelete = null;
        this.toastService.success(res.message || 'Application deleted successfully.');

        // If this was the last item on the page, move back
        if (this.pagedResult && this.pagedResult.items.length === 1 && this.currentPage > 1) {
          this.currentPage--;
        }
        this.loadApplications();
      },
      error: (err) => {
        this.deleteLoading = false;
        this.toastService.error(err.error?.message || 'Failed to delete application.');
      }
    });
  }
}

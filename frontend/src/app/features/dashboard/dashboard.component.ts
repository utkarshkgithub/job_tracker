import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardData } from '../../core/models/dashboard.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, StatusBadgeComponent],
  template: `
    <app-header title="Overview" subtitle="Here's a comprehensive overview of your job search progress.">
      <div header-actions>
        <a routerLink="/applications/new" class="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Application
        </a>
      </div>
    </app-header>

    <div class="dashboard-content">
      @if (loading) {
        <div class="dashboard-skeleton">
          <div class="summary-cards-grid">
            @for (i of [1, 2, 3, 4]; track i) {
              <div class="card skeleton-card">
                <div class="skeleton" style="width: 80px; height: 14px; margin-bottom: 12px;"></div>
                <div class="skeleton" style="width: 50px; height: 32px;"></div>
              </div>
            }
          </div>
          <div class="card skeleton-card" style="height: 220px; margin-top: 24px;"></div>
        </div>
      } @else if (error) {
        <div class="card error-state">
          <p class="error-msg">{{ error }}</p>
          <button type="button" class="btn btn-secondary" (click)="loadDashboard()">Retry</button>
        </div>
      } @else if (dashboardData) {
        <!-- Welcome Greeting -->
        <div class="welcome-banner">
          <div>
            <h2 class="welcome-title">Welcome back, {{ userName }}!</h2>
            <p class="welcome-text">
              @if (dashboardData.summary.totalApplications === 0) {
                Your job search starts here. Add your first application to track its status, interviews, and progress.
              } @else {
                You have {{ dashboardData.summary.activeApplications }} active applications and {{ dashboardData.summary.upcomingInterviewsCount }} upcoming interviews.
              }
            </p>
          </div>
          @if (dashboardData.summary.totalApplications === 0) {
            <a routerLink="/applications/new" class="btn btn-primary">Add your first application</a>
          }
        </div>

        @if (dashboardData.summary.totalApplications === 0) {
          <!-- Complete Empty State -->
          <div class="card empty-dashboard-card">
            <div class="empty-icon-wrapper">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect width="20" height="14" x="2" y="7" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </div>
            <h3 class="empty-title">No applications tracked yet</h3>
            <p class="empty-desc">
              CareerFlow centralizes every position you apply for. Log company details, track progression through interview rounds, and maintain clear follow-up timelines.
            </p>
            <a routerLink="/applications/new" class="btn btn-primary btn-lg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Record an Application
            </a>
          </div>
        } @else {
          <!-- Summary Cards Grid -->
          <div class="summary-cards-grid">
            <div class="card stat-card interactive" (click)="navigateToApplications()" role="button" tabindex="0">
              <div class="stat-header">
                <span class="stat-label">Total Applications</span>
                <span class="stat-icon-wrapper blue">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                </span>
              </div>
              <div class="stat-value">{{ dashboardData.summary.totalApplications }}</div>
              <span class="stat-hint">All tracked applications</span>
            </div>

            <div class="card stat-card interactive" (click)="navigateToActiveApplications()" role="button" tabindex="0">
              <div class="stat-header">
                <span class="stat-label">Active Applications</span>
                <span class="stat-icon-wrapper amber">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </span>
              </div>
              <div class="stat-value">{{ dashboardData.summary.activeApplications }}</div>
              <span class="stat-hint">Applied, Assessment, Interview</span>
            </div>

            <div class="card stat-card interactive" (click)="navigateToInterviews()" role="button" tabindex="0">
              <div class="stat-header">
                <span class="stat-label">Upcoming Interviews</span>
                <span class="stat-icon-wrapper purple">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </span>
              </div>
              <div class="stat-value">{{ dashboardData.summary.upcomingInterviewsCount }}</div>
              <span class="stat-hint">Scheduled rounds pending</span>
            </div>

            <div class="card stat-card interactive" (click)="navigateToOffers()" role="button" tabindex="0">
              <div class="stat-header">
                <span class="stat-label">Offers</span>
                <span class="stat-icon-wrapper green">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </span>
              </div>
              <div class="stat-value">{{ dashboardData.summary.offersCount }}</div>
              <span class="stat-hint">Received offer packages</span>
            </div>
          </div>

          <!-- Section C: Application Activity (Status Distribution) -->
          <div class="card activity-card">
            <div class="section-header-row">
              <div>
                <h3 class="section-title">Application Status Distribution</h3>
                <p class="section-subtitle">Real-time breakdown of your applications by current stage</p>
              </div>
              <a routerLink="/analytics" class="section-link">View Deep Analytics →</a>
            </div>

            <div class="status-distribution-grid">
              @for (item of dashboardData.statusDistribution; track item.status) {
                <div
                  class="status-stat-box"
                  [ngClass]="'box-' + item.status.toLowerCase()"
                  (click)="navigateToStatus(item.status)"
                  role="button"
                  tabindex="0"
                >
                  <div class="status-box-header">
                    <span class="status-box-title">{{ item.status }}</span>
                    <span class="status-box-percent">{{ item.percentage }}%</span>
                  </div>
                  <div class="status-box-count">{{ item.count }}</div>
                  <div class="status-progress-track">
                    <div
                      class="status-progress-fill"
                      [style.width.%]="item.percentage"
                    ></div>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Bottom Two Columns: Upcoming Interviews & Recent Applications -->
          <div class="dashboard-split-grid">
            <!-- Section D: Upcoming Interviews -->
            <div class="card split-card">
              <div class="section-header-row">
                <div>
                  <h3 class="section-title">Upcoming Interviews</h3>
                  <p class="section-subtitle">Chronological upcoming meetings</p>
                </div>
                <a routerLink="/interviews" class="section-link">View all</a>
              </div>

              @if (dashboardData.upcomingInterviews.length === 0) {
                <div class="empty-list-state">
                  <p>No upcoming interviews scheduled.</p>
                  <a routerLink="/interviews" class="btn btn-secondary btn-sm">+ Schedule Interview</a>
                </div>
              } @else {
                <div class="interviews-list">
                  @for (interview of dashboardData.upcomingInterviews; track interview.id) {
                    <div class="interview-row-card" (click)="openApplication(interview.jobApplicationId)">
                      <div class="interview-date-box">
                        <span class="date-month">{{ interview.scheduledAt | date:'MMM' }}</span>
                        <span class="date-day">{{ interview.scheduledAt | date:'dd' }}</span>
                      </div>
                      <div class="interview-info">
                        <div class="interview-company-line">
                          <span class="company-name">{{ interview.companyName }}</span>
                          <span class="round-badge">{{ interview.round }}</span>
                        </div>
                        <div class="interview-subline">
                          <span>{{ interview.jobTitle }}</span>
                          <span>•</span>
                          <span>{{ interview.scheduledAt | date:'shortTime' }}</span>
                          <span>•</span>
                          <span>{{ interview.type }}</span>
                        </div>
                      </div>
                      <div class="interview-action" (click)="$event.stopPropagation()">
                        @if (interview.meetingUrl) {
                          <a [href]="interview.meetingUrl" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-primary">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <polygon points="23 7 16 12 23 17 23 7"></polygon>
                              <rect width="14" height="14" x="1" y="5" rx="2" ry="2"></rect>
                            </svg>
                            Join Meeting
                          </a>
                        }
                      </div>
                    </div>
                  }
                </div>
              }
            </div>

            <!-- Section E: Recent Applications -->
            <div class="card split-card">
              <div class="section-header-row">
                <div>
                  <h3 class="section-title">Recent Applications</h3>
                  <p class="section-subtitle">Latest activity across tracked roles</p>
                </div>
                <a routerLink="/applications" class="section-link">View all</a>
              </div>

              @if (dashboardData.recentApplications.length === 0) {
                <div class="empty-list-state">
                  <p>No recent applications recorded.</p>
                  <a routerLink="/applications/new" class="btn btn-secondary btn-sm">+ Add Application</a>
                </div>
              } @else {
                <div class="applications-compact-table">
                  <table class="table">
                    <thead>
                      <tr>
                        <th>Company & Role</th>
                        <th>Status</th>
                        <th>Applied</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (app of dashboardData.recentApplications; track app.id) {
                        <tr class="clickable-tr" (click)="openApplication(app.id)">
                          <td>
                            <div class="company-cell-title">{{ app.companyName }}</div>
                            <div class="company-cell-role">{{ app.jobTitle }}</div>
                          </td>
                          <td>
                            <app-status-badge [status]="app.status"></app-status-badge>
                          </td>
                          <td class="date-cell">
                            {{ app.applicationDate | date:'MMM dd, yyyy' }}
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .dashboard-content {
      padding: 32px;
      display: flex;
      flex-direction: column;
      gap: 24px;
      max-width: 1400px;
      width: 100%;
    }

    .welcome-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }

    .welcome-title {
      font-size: 24px;
      font-weight: 700;
      color: var(--text-main);
      letter-spacing: -0.02em;
    }

    .welcome-text {
      font-size: 14.5px;
      color: var(--text-secondary);
      margin-top: 4px;
    }

    /* Summary Cards */
    .summary-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 18px;
    }

    .stat-card {
      padding: 20px;
      transition: all var(--transition-fast);
    }

    .stat-card.interactive {
      cursor: pointer;
    }

    .stat-card.interactive:hover {
      border-color: var(--border-strong);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .stat-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .stat-label {
      font-size: 13.5px;
      font-weight: 600;
      color: var(--text-secondary);
    }

    .stat-icon-wrapper {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon-wrapper.blue { background-color: #eff6ff; color: #2563eb; }
    .stat-icon-wrapper.amber { background-color: #fffbeb; color: #d97706; }
    .stat-icon-wrapper.purple { background-color: #f5f3ff; color: #7c3aed; }
    .stat-icon-wrapper.green { background-color: #ecfdf5; color: #059669; }

    .stat-value {
      font-size: 32px;
      font-weight: 700;
      color: var(--text-main);
      line-height: 1;
      letter-spacing: -0.03em;
      margin-bottom: 6px;
    }

    .stat-hint {
      font-size: 12px;
      color: var(--text-muted);
    }

    /* Activity Card & Status Distribution */
    .activity-card {
      padding: 24px;
    }

    .section-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
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

    .section-link {
      font-size: 13px;
      font-weight: 600;
      color: var(--primary);
    }

    .status-distribution-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 14px;
    }

    .status-stat-box {
      padding: 16px;
      border-radius: var(--radius-md);
      background-color: var(--bg-app);
      border: 1px solid var(--border-main);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .status-stat-box:hover {
      border-color: var(--border-strong);
      transform: translateY(-2px);
      box-shadow: var(--shadow-sm);
    }

    .status-box-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12.5px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .status-box-count {
      font-size: 24px;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 10px;
      line-height: 1;
    }

    .status-progress-track {
      height: 5px;
      width: 100%;
      background-color: var(--border-light);
      border-radius: var(--radius-full);
      overflow: hidden;
    }

    .status-progress-fill {
      height: 100%;
      border-radius: var(--radius-full);
      background-color: var(--primary);
      transition: width 0.5s ease;
    }

    .box-applied .status-progress-fill { background-color: #3b82f6; }
    .box-assessment .status-progress-fill { background-color: #8b5cf6; }
    .box-interview .status-progress-fill { background-color: #f59e0b; }
    .box-offer .status-progress-fill { background-color: #10b981; }
    .box-rejected .status-progress-fill { background-color: #ef4444; }
    .box-withdrawn .status-progress-fill { background-color: #64748b; }

    /* Split Grid */
    .dashboard-split-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .split-card {
      padding: 24px;
      display: flex;
      flex-direction: column;
    }

    .interviews-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .interview-row-card {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 12px;
      border-radius: var(--radius-md);
      background-color: var(--bg-app);
      border: 1px solid var(--border-main);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .interview-row-card:hover {
      border-color: var(--border-strong);
      background-color: var(--bg-surface-hover);
    }

    .interview-date-box {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-control);
      background-color: var(--raised);
      border: 1px solid var(--border);
      color: var(--text);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-weight: 700;
      line-height: 1.1;
    }

    .date-month { font-size: 11px; text-transform: uppercase; color: var(--muted); font-weight: 600; }
    .date-day { font-size: 16px; font-weight: 700; color: var(--text); }

    .interview-info {
      flex: 1;
      min-width: 0;
    }

    .interview-company-line {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 2px;
    }

    .company-name {
      font-size: 14.5px;
      font-weight: 600;
      color: var(--text-main);
    }

    .round-badge {
      font-size: 11.5px;
      font-weight: 600;
      padding: 2px 7px;
      border-radius: var(--radius-full);
      background-color: var(--bg-surface);
      border: 1px solid var(--border-main);
      color: var(--text-secondary);
    }

    .interview-subline {
      font-size: 12.5px;
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }

    .applications-compact-table {
      margin-top: -6px;
    }

    .clickable-tr {
      cursor: pointer;
    }

    .company-cell-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-main);
    }

    .company-cell-role {
      font-size: 12.5px;
      color: var(--text-secondary);
    }

    .date-cell {
      font-size: 13px;
      color: var(--text-secondary);
      white-space: nowrap;
    }

    .empty-list-state {
      padding: 36px 16px;
      text-align: center;
      color: var(--text-muted);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    /* Complete Empty State */
    .empty-dashboard-card {
      padding: 56px 24px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      max-width: 580px;
      margin: 20px auto;
    }

    .empty-icon-wrapper {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background-color: var(--raised);
      border: 1px solid var(--border);
      color: var(--text);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
    }

    .empty-title {
      font-size: 20px;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 8px;
    }

    .empty-desc {
      font-size: 14.5px;
      color: var(--text-secondary);
      line-height: 1.5;
      margin-bottom: 24px;
    }

    .btn-lg {
      padding: 12px 24px;
      font-size: 15px;
    }

    @media (max-width: 1024px) {
      .dashboard-split-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 640px) {
      .dashboard-content {
        padding: 20px 16px;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = true;
  error = '';
  dashboardData: DashboardData | null = null;

  get userName(): string {
    return this.authService.currentUser()?.fullName || 'Job Seeker';
  }

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = '';

    this.dashboardService.getDashboard().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load dashboard data. Please check your connection.';
        this.loading = false;
      }
    });
  }

  navigateToApplications() {
    this.router.navigate(['/applications']);
  }

  navigateToActiveApplications() {
    // Navigates with status filter
    this.router.navigate(['/applications'], { queryParams: { status: 'Applied' } });
  }

  navigateToInterviews() {
    this.router.navigate(['/interviews'], { queryParams: { filter: 'upcoming' } });
  }

  navigateToOffers() {
    this.router.navigate(['/applications'], { queryParams: { status: 'Offer' } });
  }

  navigateToStatus(status: string) {
    this.router.navigate(['/applications'], { queryParams: { status } });
  }

  openApplication(id: number) {
    this.router.navigate(['/applications', id]);
  }
}

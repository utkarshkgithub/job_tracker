import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { DashboardService } from '../../core/services/dashboard.service';
import { AnalyticsData } from '../../core/models/dashboard.model';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  template: `
    <app-header title="Analytics" subtitle="Deep insights, trends, and conversion funnels across your job applications.">
      <div header-actions>
        <div class="period-selector-wrapper">
          <label for="period-select" class="sr-only">Period</label>
          <select id="period-select" class="period-select" [value]="selectedPeriod" (change)="onPeriodChange($event)">
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
            <option value="year">This year</option>
            <option value="all">All time</option>
          </select>
        </div>
      </div>
    </app-header>

    <div class="analytics-container">
      @if (loading) {
        <div class="card skeleton-card" style="height: 120px; margin-bottom: 24px;"></div>
        <div class="card skeleton-card" style="height: 300px; margin-bottom: 24px;"></div>
        <div class="card skeleton-card" style="height: 250px;"></div>
      } @else if (error) {
        <div class="card error-box">
          <p>{{ error }}</p>
          <button type="button" class="btn btn-secondary" (click)="loadAnalytics()">Retry</button>
        </div>
      } @else if (analytics) {
        <!-- Section B: Period Summary Cards -->
        <div class="summary-cards-grid">
          <div class="card summary-stat-card">
            <span class="stat-title">Applications Submitted</span>
            <div class="stat-number blue-text">{{ analytics.totalApplicationsInPeriod }}</div>
            <span class="stat-subtext">Recorded during selected period</span>
          </div>

          <div class="card summary-stat-card">
            <span class="stat-title">Interviews Scheduled</span>
            <div class="stat-number purple-text">{{ analytics.scheduledInterviewsInPeriod }}</div>
            <span class="stat-subtext">Rounds held or scheduled</span>
          </div>

          <div class="card summary-stat-card">
            <span class="stat-title">Offers Received</span>
            <div class="stat-number green-text">{{ analytics.offersReceivedInPeriod }}</div>
            <span class="stat-subtext">Offers received in period</span>
          </div>
        </div>

        <!-- Section E: Conversion Funnel Card -->
        <div class="card funnel-card">
          <div class="section-header-box">
            <div>
              <h3 class="section-title">Job Search Conversion Funnel</h3>
              <p class="section-subtitle">Observed progression: Applications → Interview Stage → Offers</p>
            </div>
            <div class="overall-badge">
              Overall Win Rate: <strong>{{ analytics.conversionFunnel.overallConversionRate }}%</strong>
            </div>
          </div>

          <div class="funnel-steps-grid">
            <!-- Step 1: Applications -->
            <div class="funnel-step-box step-applications">
              <div class="funnel-step-label">Applications</div>
              <div class="funnel-step-count">{{ analytics.conversionFunnel.applicationsCount }}</div>
              <span class="funnel-step-sub">Initial submissions</span>
            </div>

            <div class="funnel-connector-arrow">
              <div class="rate-tag">{{ analytics.conversionFunnel.applicationToInterviewRate }}%</div>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>

            <!-- Step 2: Interviews -->
            <div class="funnel-step-box step-interviews">
              <div class="funnel-step-label">Interview Stage</div>
              <div class="funnel-step-count">{{ analytics.conversionFunnel.interviewsStageCount }}</div>
              <span class="funnel-step-sub">Advanced to rounds</span>
            </div>

            <div class="funnel-connector-arrow">
              <div class="rate-tag">{{ analytics.conversionFunnel.interviewToOfferRate }}%</div>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>

            <!-- Step 3: Offers -->
            <div class="funnel-step-box step-offers">
              <div class="funnel-step-label">Offers</div>
              <div class="funnel-step-count">{{ analytics.conversionFunnel.offersCount }}</div>
              <span class="funnel-step-sub">Formal packages</span>
            </div>
          </div>
        </div>

        <!-- Two Columns: Application Trends & Status Breakdown -->
        <div class="analytics-split-grid">
          <!-- Section C: Application Trend Chart -->
          <div class="card trend-card">
            <div class="section-header-box">
              <div>
                <h3 class="section-title">Application Activity Trend</h3>
                <p class="section-subtitle">Application creation volume over time</p>
              </div>
            </div>

            @if (analytics.applicationTrends.length === 0 || maxTrendCount === 0) {
              <div class="empty-chart-notice">
                <p>No activity trends recorded for this period.</p>
              </div>
            } @else {
              <div class="bar-chart-container">
                @for (pt of analytics.applicationTrends; track pt.dateLabel) {
                  <div class="chart-bar-column">
                    <div class="bar-value-label">{{ pt.count }}</div>
                    <div class="bar-track">
                      <div
                        class="bar-fill"
                        [style.height.%]="getBarHeight(pt.count)"
                        [title]="pt.dateLabel + ': ' + pt.count + ' applications'"
                      ></div>
                    </div>
                    <div class="bar-date-label">{{ pt.dateLabel }}</div>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Section D: Applications by Status Breakdown -->
          <div class="card status-breakdown-card">
            <div class="section-header-box">
              <div>
                <h3 class="section-title">Applications by Status</h3>
                <p class="section-subtitle">Distribution of stages (Click to view filtered)</p>
              </div>
            </div>

            <div class="status-bars-list">
              @for (st of analytics.statusDistribution; track st.status) {
                <div class="status-row-item" (click)="openApplicationsByStatus(st.status)" role="button" tabindex="0">
                  <div class="status-row-info">
                    <span class="status-name-tag">{{ st.status }}</span>
                    <span class="status-val-tag">
                      <strong>{{ st.count }}</strong> ({{ st.percentage }}%)
                    </span>
                  </div>
                  <div class="status-bar-track">
                    <div
                      class="status-bar-fill"
                      [ngClass]="'fill-' + st.status.toLowerCase()"
                      [style.width.%]="st.percentage"
                    ></div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .analytics-container {
      padding: 32px;
      display: flex;
      flex-direction: column;
      gap: 24px;
      max-width: 1400px;
      width: 100%;
    }

    .period-select {
      padding: 8px 14px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-main);
      background-color: var(--bg-surface);
      color: var(--text-main);
      font-size: 13.5px;
      font-weight: 500;
      cursor: pointer;
    }

    .period-select:focus {
      outline: none;
      border-color: var(--border-focus);
    }

    /* Summary Cards */
    .summary-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 18px;
    }

    .summary-stat-card {
      padding: 22px;
      display: flex;
      flex-direction: column;
    }

    .stat-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 8px;
    }

    .stat-number {
      font-size: 36px;
      font-weight: 800;
      line-height: 1.1;
      margin-bottom: 6px;
      letter-spacing: -0.03em;
    }

    .blue-text { color: #2563eb; }
    .purple-text { color: #7c3aed; }
    .green-text { color: #059669; }

    .stat-subtext {
      font-size: 12.5px;
      color: var(--text-muted);
    }

    /* Funnel Card */
    .funnel-card {
      padding: 28px;
    }

    .section-header-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 12px;
    }

    .section-title {
      font-size: 17px;
      font-weight: 700;
      color: var(--text-main);
    }

    .section-subtitle {
      font-size: 13px;
      color: var(--text-secondary);
      margin-top: 2px;
    }

    .overall-badge {
      font-size: 13px;
      background-color: #ecfdf5;
      color: #047857;
      padding: 6px 14px;
      border-radius: var(--radius-full);
      border: 1px solid #a7f3d0;
    }

    .funnel-steps-grid {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
    }

    .funnel-step-box {
      flex: 1;
      min-width: 160px;
      padding: 20px 16px;
      border-radius: var(--radius-md);
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 4px;
      border: 1px solid var(--border-main);
    }

    .step-applications { background-color: var(--bg-app); border-top: 4px solid #3b82f6; }
    .step-interviews { background-color: var(--bg-app); border-top: 4px solid #8b5cf6; }
    .step-offers { background-color: var(--bg-app); border-top: 4px solid #10b981; }

    .funnel-step-label {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .funnel-step-count {
      font-size: 28px;
      font-weight: 800;
      color: var(--text-main);
    }

    .funnel-step-sub {
      font-size: 11.5px;
      color: var(--text-muted);
    }

    .funnel-connector-arrow {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      color: var(--text-muted);
    }

    .rate-tag {
      font-size: 11.5px;
      font-weight: 700;
      color: var(--primary);
      background-color: var(--primary-light);
      padding: 2px 6px;
      border-radius: var(--radius-full);
    }

    /* Split Grid */
    .analytics-split-grid {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 24px;
    }

    .trend-card, .status-breakdown-card {
      padding: 24px;
    }

    /* Bar Chart */
    .bar-chart-container {
      display: flex;
      align-items: flex-end;
      height: 220px;
      gap: 16px;
      padding: 16px 8px 0;
      border-bottom: 1px solid var(--border-main);
    }

    .chart-bar-column {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;
      justify-content: flex-end;
      gap: 6px;
    }

    .bar-value-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-secondary);
    }

    .bar-track {
      width: 100%;
      max-width: 44px;
      height: 150px;
      background-color: var(--bg-app);
      border-radius: 4px 4px 0 0;
      display: flex;
      align-items: flex-end;
    }

    .bar-fill {
      width: 100%;
      background: linear-gradient(180deg, var(--primary), #818cf8);
      border-radius: 4px 4px 0 0;
      transition: height 0.4s ease;
      min-height: 4px;
    }

    .bar-fill:hover {
      opacity: 0.85;
    }

    .bar-date-label {
      font-size: 11px;
      color: var(--text-muted);
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      max-width: 70px;
      text-align: center;
    }

    /* Status Bars List */
    .status-bars-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 10px;
    }

    .status-row-item {
      display: flex;
      flex-direction: column;
      gap: 6px;
      cursor: pointer;
      padding: 6px;
      border-radius: var(--radius-sm);
      transition: background-color var(--transition-fast);
    }

    .status-row-item:hover {
      background-color: var(--bg-surface-hover);
    }

    .status-row-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 13.5px;
    }

    .status-name-tag {
      font-weight: 600;
      color: var(--text-main);
    }

    .status-val-tag {
      color: var(--text-secondary);
      font-size: 12.5px;
    }

    .status-bar-track {
      height: 8px;
      width: 100%;
      background-color: var(--bg-app);
      border-radius: var(--radius-full);
      overflow: hidden;
    }

    .status-bar-fill {
      height: 100%;
      border-radius: var(--radius-full);
      transition: width 0.5s ease;
    }

    .fill-applied { background-color: #3b82f6; }
    .fill-assessment { background-color: #8b5cf6; }
    .fill-interview { background-color: #f59e0b; }
    .fill-offer { background-color: #10b981; }
    .fill-rejected { background-color: #ef4444; }
    .fill-withdrawn { background-color: #64748b; }

    .empty-chart-notice {
      padding: 48px;
      text-align: center;
      color: var(--text-muted);
      font-size: 14px;
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

    @media (max-width: 900px) {
      .analytics-split-grid {
        grid-template-columns: 1fr;
      }
      .funnel-connector-arrow {
        transform: rotate(90deg);
        margin: 8px 0;
      }
      .funnel-steps-grid {
        flex-direction: column;
      }
      .funnel-step-box {
        width: 100%;
      }
    }
  `]
})
export class AnalyticsComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private router = inject(Router);

  loading = true;
  error = '';
  selectedPeriod = '30days';
  analytics: AnalyticsData | null = null;

  get maxTrendCount(): number {
    if (!this.analytics || this.analytics.applicationTrends.length === 0) return 1;
    return Math.max(...this.analytics.applicationTrends.map(t => t.count), 1);
  }

  ngOnInit(): void {
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.loading = true;
    this.error = '';

    this.dashboardService.getAnalytics(this.selectedPeriod).subscribe({
      next: (data) => {
        this.analytics = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load analytics trends. Please check your connection.';
        this.loading = false;
      }
    });
  }

  onPeriodChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedPeriod = select.value;
    this.loadAnalytics();
  }

  getBarHeight(count: number): number {
    if (this.maxTrendCount === 0) return 0;
    return Math.max(Math.round((count / this.maxTrendCount) * 100), 4);
  }

  openApplicationsByStatus(status: string): void {
    this.router.navigate(['/applications'], { queryParams: { status } });
  }
}

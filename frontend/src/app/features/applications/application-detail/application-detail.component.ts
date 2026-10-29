import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { InterviewModalComponent } from '../../interviews/interview-modal/interview-modal.component';
import { ApplicationService } from '../../../core/services/application.service';
import { InterviewService } from '../../../core/services/interview.service';
import { ToastService } from '../../../core/services/toast.service';
import { JobApplication } from '../../../core/models/application.model';
import { Interview } from '../../../core/models/interview.model';

@Component({
  selector: 'app-application-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    StatusBadgeComponent,
    ConfirmDialogComponent,
    InterviewModalComponent
  ],
  template: `
    @if (loading) {
      <app-header title="Application Details" subtitle="Loading record details...">
        <div header-actions>
          <a routerLink="/applications" class="btn btn-secondary">Back to Applications</a>
        </div>
      </app-header>
      <div class="detail-container">
        <div class="card skeleton-card" style="height: 180px; margin-bottom: 24px;"></div>
        <div class="card skeleton-card" style="height: 240px;"></div>
      </div>
    } @else if (error || !application) {
      <app-header title="Not Found" subtitle="Could not load application.">
        <div header-actions>
          <a routerLink="/applications" class="btn btn-secondary">Back to Applications</a>
        </div>
      </app-header>
      <div class="detail-container">
        <div class="card error-card">
          <h3>Application Not Found</h3>
          <p>{{ error || 'The requested application does not exist or you do not have permission to view it.' }}</p>
          <a routerLink="/applications" class="btn btn-primary" style="margin-top: 16px;">Return to Applications</a>
        </div>
      </div>
    } @else {
      <!-- Main Header with breadcrumbs and actions -->
      <app-header [title]="application.companyName" [subtitle]="application.jobTitle">
        <div header-actions class="header-action-group">
          <a routerLink="/applications" class="btn btn-secondary btn-sm">
            ← Back to Applications
          </a>
          <a [routerLink]="['/applications', application.id, 'edit']" class="btn btn-secondary btn-sm" id="edit-app-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Edit
          </a>
          <button type="button" class="btn btn-destructive btn-sm" (click)="isDeleteModalOpen = true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Delete
          </button>
        </div>
      </app-header>

      <div class="detail-container">
        <!-- Overview Hero Card -->
        <div class="card hero-info-card">
          <div class="hero-main-row">
            <div class="hero-avatar">
              {{ application.companyName.substring(0, 1).toUpperCase() }}
            </div>
            <div class="hero-titles">
              <div class="hero-company-badge-row">
                <h2 class="hero-company">{{ application.companyName }}</h2>
                <app-status-badge [status]="application.status"></app-status-badge>
              </div>
              <h3 class="hero-position">{{ application.jobTitle }}</h3>
              <div class="hero-meta-items">
                <span class="meta-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                  </svg>
                  Applied on {{ application.applicationDate | date:'MMMM dd, yyyy' }}
                </span>
                @if (application.jobPostingUrl) {
                  <a [href]="application.jobPostingUrl" target="_blank" rel="noopener noreferrer" class="meta-item meta-link">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                    View Original Posting
                  </a>
                }
              </div>
            </div>

            <!-- Status Quick Change Selector -->
            <div class="status-quick-change">
              <label for="change-status-select" class="status-change-label">Change Status:</label>
              <select
                id="change-status-select"
                class="status-select-control"
                [disabled]="updatingStatus"
                [value]="currentStatusNumber"
                (change)="onStatusChange($event)"
              >
                <option [value]="0">Applied</option>
                <option [value]="1">Assessment</option>
                <option [value]="2">Interview</option>
                <option [value]="3">Offer</option>
                <option [value]="4">Rejected</option>
                <option [value]="5">Withdrawn</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Two Column Layout: Interviews Timeline & Notes/Metadata -->
        <div class="detail-columns-grid">
          <!-- Left Column: Interview Timeline -->
          <div class="card timeline-card">
            <div class="timeline-header">
              <div>
                <h3 class="section-title">Interview Timeline</h3>
                <p class="section-subtitle">Chronological progression of interview rounds</p>
              </div>
              <button type="button" class="btn btn-primary btn-sm" (click)="openAddInterview()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add Interview
              </button>
            </div>

            @if (interviewsLoading) {
              <div class="skeleton" style="height: 120px; width: 100%;"></div>
            } @else if (interviews.length === 0) {
              <div class="empty-timeline-box">
                <div class="empty-timeline-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
                <h4>No interviews scheduled yet</h4>
                <p>Track your phone screening, technical rounds, or manager reviews as they are scheduled.</p>
                <button type="button" class="btn btn-secondary btn-sm" (click)="openAddInterview()">
                  Schedule First Interview
                </button>
              </div>
            } @else {
              <div class="timeline-list">
                @for (interview of interviews; track interview.id) {
                  <div class="timeline-item-card" [class.upcoming]="interview.isUpcoming">
                    <div class="timeline-left">
                      <div class="timeline-date-chip">
                        <span class="chip-m">{{ interview.scheduledAt | date:'MMM' }}</span>
                        <span class="chip-d">{{ interview.scheduledAt | date:'dd' }}</span>
                      </div>
                      <div class="timeline-connector"></div>
                    </div>

                    <div class="timeline-body">
                      <div class="timeline-item-top">
                        <div class="timeline-title-row">
                          <h4 class="interview-round-name">{{ interview.round }}</h4>
                          @if (interview.isUpcoming) {
                            <span class="upcoming-tag">Upcoming</span>
                          }
                        </div>
                        <div class="timeline-actions">
                          <button type="button" class="btn-icon" (click)="openEditInterview(interview)" aria-label="Edit interview">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                          <button type="button" class="btn-icon danger-icon" (click)="promptDeleteInterview(interview)" aria-label="Delete interview">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div class="interview-meta-row">
                        <span>⏰ {{ interview.scheduledAt | date:'shortTime' }}</span>
                        <span>•</span>
                        <span>📍 {{ interview.type }}</span>
                        @if (interview.meetingUrl) {
                          <span>•</span>
                          <a [href]="interview.meetingUrl" target="_blank" rel="noopener noreferrer" class="meeting-link-btn">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <polygon points="23 7 16 12 23 17 23 7"></polygon>
                              <rect width="14" height="14" x="1" y="5" rx="2" ry="2"></rect>
                            </svg>
                            Join Video Call
                          </a>
                        }
                      </div>

                      @if (interview.notes) {
                        <p class="interview-notes-text">{{ interview.notes }}</p>
                      }
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Right Column: Notes & Metadata -->
          <div class="detail-sidebar-column">
            <!-- Notes Card -->
            <div class="card notes-card">
              <div class="notes-header">
                <h3 class="section-title">Application Notes</h3>
                <a [routerLink]="['/applications', application.id, 'edit']" class="edit-notes-link">Edit notes</a>
              </div>
              @if (application.notes) {
                <div class="notes-body-text">{{ application.notes }}</div>
              } @else {
                <p class="empty-notes-hint">No notes recorded for this application yet. Use notes to log referral contacts, compensation expectations, or recruiter emails.</p>
              }
            </div>

            <!-- Metadata Details Card -->
            <div class="card metadata-card">
              <h3 class="section-title" style="margin-bottom: 14px;">Record Information</h3>
              <div class="meta-row">
                <span class="meta-label">Created</span>
                <span class="meta-val">{{ application.createdAt | date:'mediumDate' }}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Last Updated</span>
                <span class="meta-val">{{ application.updatedAt | date:'mediumDate' }}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Interviews</span>
                <span class="meta-val">{{ interviews.length }} logged</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add/Edit Interview Modal -->
      <app-interview-modal
        [isOpen]="isInterviewModalOpen"
        [lockedApplicationId]="application.id"
        [lockedApplicationTitle]="application.companyName + ' — ' + application.jobTitle"
        [interviewToEdit]="interviewToEdit"
        (close)="isInterviewModalOpen = false; interviewToEdit = null"
        (saved)="onInterviewSaved()"
      ></app-interview-modal>

      <!-- Delete Application Confirmation Dialog -->
      <app-confirm-dialog
        [isOpen]="isDeleteModalOpen"
        title="Delete Application"
        [message]="'Delete application for ' + application.companyName + '?'"
        subtext="This will permanently delete this job application and all associated interview schedules."
        confirmText="Delete Application"
        cancelText="Cancel"
        [isDestructive]="true"
        [loading]="deleteLoading"
        (confirm)="confirmDeleteApplication()"
        (cancel)="isDeleteModalOpen = false"
      ></app-confirm-dialog>

      <!-- Delete Interview Confirmation Dialog -->
      <app-confirm-dialog
        [isOpen]="isDeleteInterviewModalOpen"
        title="Delete Interview"
        [message]="'Delete ' + (interviewToDelete?.round || 'interview') + ' round?'"
        subtext="This removes only this interview record. The job application remains intact."
        confirmText="Delete Interview"
        cancelText="Cancel"
        [isDestructive]="true"
        [loading]="deleteInterviewLoading"
        (confirm)="confirmDeleteInterview()"
        (cancel)="isDeleteInterviewModalOpen = false; interviewToDelete = null"
      ></app-confirm-dialog>
    }
  `,
  styles: [`
    .detail-container {
      padding: 32px;
      display: flex;
      flex-direction: column;
      gap: 24px;
      max-width: 1400px;
      width: 100%;
    }

    .header-action-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Hero Card */
    .hero-info-card {
      padding: 28px;
    }

    .hero-main-row {
      display: flex;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;
    }

    .hero-avatar {
      width: 56px;
      height: 56px;
      border-radius: var(--radius-control);
      background-color: var(--raised);
      border: 1px solid var(--border);
      color: var(--text);
      font-size: 22px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .hero-titles {
      flex: 1;
      min-width: 240px;
    }

    .hero-company-badge-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 4px;
    }

    .hero-company {
      font-size: 22px;
      font-weight: 700;
      color: var(--text-main);
      letter-spacing: -0.02em;
    }

    .hero-position {
      font-size: 16px;
      font-weight: 500;
      color: var(--text-secondary);
      margin-bottom: 10px;
    }

    .hero-meta-items {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .meta-item {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: var(--text-muted);
    }

    .meta-link {
      color: var(--primary);
      font-weight: 500;
    }

    .meta-link:hover {
      text-decoration: underline;
    }

    .status-quick-change {
      display: flex;
      flex-direction: column;
      gap: 6px;
      align-items: flex-end;
      margin-left: auto;
    }

    .status-change-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .status-select-control {
      padding: 7px 12px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-main);
      background-color: var(--bg-surface);
      color: var(--text-main);
      font-size: 13.5px;
      font-weight: 500;
      cursor: pointer;
    }

    .status-select-control:focus {
      outline: none;
      border-color: var(--border-focus);
    }

    /* Grid Layout */
    .detail-columns-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 24px;
    }

    .timeline-card {
      padding: 24px;
    }

    .timeline-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
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

    .empty-timeline-box {
      padding: 48px 16px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }

    .empty-timeline-icon {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background-color: var(--primary-light);
      color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 4px;
    }

    .empty-timeline-box h4 {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-main);
    }

    .empty-timeline-box p {
      font-size: 13.5px;
      color: var(--text-secondary);
      max-width: 360px;
      line-height: 1.4;
      margin-bottom: 8px;
    }

    /* Timeline Items */
    .timeline-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .timeline-item-card {
      display: flex;
      gap: 16px;
      padding: 16px;
      border-radius: var(--radius-md);
      background-color: var(--bg-app);
      border: 1px solid var(--border-main);
      transition: all var(--transition-fast);
    }

    .timeline-item-card.upcoming {
      border-color: var(--primary);
      background-color: var(--bg-surface);
      box-shadow: 0 2px 8px var(--primary-glow);
    }

    .timeline-left {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex-shrink: 0;
    }

    .timeline-date-chip {
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
      font-weight: 700;
      line-height: 1.1;
    }

    .chip-m { font-size: 11px; text-transform: uppercase; color: var(--muted); font-weight: 600; }
    .chip-d { font-size: 16px; color: var(--text); font-weight: 700; }

    .timeline-body {
      flex: 1;
      min-width: 0;
    }

    .timeline-item-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;
    }

    .timeline-title-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .interview-round-name {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-main);
    }

    .upcoming-tag {
      font-size: 11px;
      font-weight: 600;
      color: var(--pill-positive-ink);
      background-color: var(--pill-positive-bg);
      padding: 2px 8px;
      border-radius: var(--radius-chip);
      border: 1px solid var(--pill-positive-border);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .timeline-actions {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .danger-icon:hover {
      color: #ef4444;
      background-color: #fef2f2;
    }

    .interview-meta-row {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12.5px;
      color: var(--text-secondary);
      margin-bottom: 8px;
      flex-wrap: wrap;
    }

    .meeting-link-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-weight: 600;
      color: var(--primary);
    }

    .interview-notes-text {
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.4;
      background-color: var(--bg-surface);
      padding: 8px 12px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-light);
    }

    /* Right Column Cards */
    .detail-sidebar-column {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .notes-card, .metadata-card {
      padding: 22px;
    }

    .notes-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .edit-notes-link {
      font-size: 12.5px;
      font-weight: 600;
      color: var(--primary);
    }

    .notes-body-text {
      font-size: 14px;
      color: var(--text-secondary);
      line-height: 1.6;
      white-space: pre-wrap;
    }

    .empty-notes-hint {
      font-size: 13px;
      color: var(--text-muted);
      line-height: 1.5;
    }

    .meta-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid var(--border-light);
      font-size: 13px;
    }

    .meta-row:last-child {
      border-bottom: none;
    }

    .meta-label {
      color: var(--text-muted);
    }

    .meta-val {
      font-weight: 600;
      color: var(--text-main);
    }

    .error-card {
      text-align: center;
      padding: 48px;
    }

    @media (max-width: 900px) {
      .detail-columns-grid {
        grid-template-columns: 1fr;
      }
      .detail-container {
        padding: 20px 16px;
      }
      .status-quick-change {
        margin-left: 0;
        align-items: flex-start;
      }
    }
  `]
})
export class ApplicationDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private applicationService = inject(ApplicationService);
  private interviewService = inject(InterviewService);
  private toastService = inject(ToastService);

  applicationId!: number;
  application: JobApplication | null = null;
  interviews: Interview[] = [];

  loading = true;
  interviewsLoading = true;
  updatingStatus = false;
  error = '';

  isInterviewModalOpen = false;
  interviewToEdit: Interview | null = null;

  isDeleteModalOpen = false;
  deleteLoading = false;

  isDeleteInterviewModalOpen = false;
  deleteInterviewLoading = false;
  interviewToDelete: Interview | null = null;

  get currentStatusNumber(): number {
    if (!this.application) return 0;
    if (typeof this.application.status === 'number') return this.application.status;
    const map: Record<string, number> = {
      'Applied': 0,
      'Assessment': 1,
      'Interview': 2,
      'Offer': 3,
      'Rejected': 4,
      'Withdrawn': 5
    };
    return map[this.application.status] ?? 0;
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.applicationId = parseInt(idParam, 10);
      this.loadApplication();
      this.loadInterviews();
    }
  }

  loadApplication(): void {
    this.loading = true;
    this.applicationService.getById(this.applicationId).subscribe({
      next: (app) => {
        this.application = app;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load application details.';
        this.loading = false;
      }
    });
  }

  loadInterviews(): void {
    this.interviewsLoading = true;
    this.interviewService.getByApplicationId(this.applicationId).subscribe({
      next: (data) => {
        this.interviews = data;
        this.interviewsLoading = false;
      },
      error: () => {
        this.interviewsLoading = false;
      }
    });
  }

  onStatusChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newStatus = parseInt(select.value, 10);

    this.updatingStatus = true;
    this.applicationService.updateStatus(this.applicationId, newStatus).subscribe({
      next: (res) => {
        this.updatingStatus = false;
        if (this.application && res.data) {
          this.application.status = res.data.status;
          this.application.statusName = res.data.statusName;
        }
        this.toastService.success(res.message || 'Status updated successfully.');
      },
      error: (err) => {
        this.updatingStatus = false;
        this.toastService.error(err.error?.message || 'Failed to update status.');
        // Revert UI to current status
        select.value = this.currentStatusNumber.toString();
      }
    });
  }

  openAddInterview(): void {
    this.interviewToEdit = null;
    this.isInterviewModalOpen = true;
  }

  openEditInterview(interview: Interview): void {
    this.interviewToEdit = interview;
    this.isInterviewModalOpen = true;
  }

  onInterviewSaved(): void {
    this.loadInterviews();
  }

  promptDeleteInterview(interview: Interview): void {
    this.interviewToDelete = interview;
    this.isDeleteInterviewModalOpen = true;
  }

  confirmDeleteInterview(): void {
    if (!this.interviewToDelete) return;
    this.deleteInterviewLoading = true;

    this.interviewService.delete(this.interviewToDelete.id).subscribe({
      next: (res) => {
        this.deleteInterviewLoading = false;
        this.isDeleteInterviewModalOpen = false;
        this.interviewToDelete = null;
        this.toastService.success(res.message || 'Interview deleted successfully.');
        this.loadInterviews();
      },
      error: (err) => {
        this.deleteInterviewLoading = false;
        this.toastService.error(err.error?.message || 'Failed to delete interview.');
      }
    });
  }

  confirmDeleteApplication(): void {
    this.deleteLoading = true;
    this.applicationService.delete(this.applicationId).subscribe({
      next: (res) => {
        this.deleteLoading = false;
        this.isDeleteModalOpen = false;
        this.toastService.success(res.message || 'Application deleted successfully.');
        this.router.navigate(['/applications']);
      },
      error: (err) => {
        this.deleteLoading = false;
        this.toastService.error(err.error?.message || 'Failed to delete application.');
      }
    });
  }
}

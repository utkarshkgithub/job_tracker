import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { InterviewModalComponent } from '../interview-modal/interview-modal.component';
import { InterviewService } from '../../../core/services/interview.service';
import { ToastService } from '../../../core/services/toast.service';
import { Interview } from '../../../core/models/interview.model';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  events: Interview[];
}

@Component({
  selector: 'app-interview-list',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, ConfirmDialogComponent, InterviewModalComponent],
  template: `
    <app-header title="Interviews" subtitle="Consolidated view of upcoming and past interview schedules.">
      <div header-actions>
        <button type="button" class="btn btn-primary" id="add-interview-header-btn" (click)="openAddInterview()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Interview
        </button>
      </div>
    </app-header>

    <div class="interviews-container">
      <!-- Toolbar: View Mode (List vs Calendar) & Filter Tabs -->
      <div class="interviews-toolbar-card card">
        <div class="toolbar-left">
          <!-- Time Filters -->
          <div class="time-filter-tabs">
            <button
              type="button"
              class="tab-btn"
              [class.active]="selectedTab === 'upcoming'"
              (click)="selectTab('upcoming')"
            >
              Upcoming
            </button>
            <button
              type="button"
              class="tab-btn"
              [class.active]="selectedTab === 'past'"
              (click)="selectTab('past')"
            >
              Past
            </button>
            <button
              type="button"
              class="tab-btn"
              [class.active]="selectedTab === 'all'"
              (click)="selectTab('all')"
            >
              All
            </button>
          </div>
        </div>

        <div class="toolbar-right">
          <!-- List vs Calendar View Toggle -->
          <div class="view-mode-toggle">
            <button
              type="button"
              class="toggle-btn"
              [class.active]="viewMode === 'list'"
              (click)="viewMode = 'list'"
              aria-label="List view"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
              List View
            </button>
            <button
              type="button"
              class="toggle-btn"
              [class.active]="viewMode === 'calendar'"
              (click)="switchToCalendar()"
              aria-label="Calendar view"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Calendar View
            </button>
          </div>
        </div>
      </div>

      <!-- Main Display -->
      @if (loading) {
        <div class="card skeleton-card" style="height: 280px;"></div>
      } @else if (error) {
        <div class="card empty-state-card">
          <p class="error-msg">{{ error }}</p>
          <button type="button" class="btn btn-secondary" (click)="loadInterviews()">Retry</button>
        </div>
      } @else {
        <!-- Mode 1: List View -->
        @if (viewMode === 'list') {
          @if (interviews.length === 0) {
            <div class="card empty-state-card">
              <div class="empty-icon-circle">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <h3>No {{ selectedTab }} interviews found</h3>
              <p>You can schedule an interview from here or from any application's detail page.</p>
              <button type="button" class="btn btn-primary" (click)="openAddInterview()">Schedule Interview</button>
            </div>
          } @else {
            <div class="interviews-grid">
              @for (interview of interviews; track interview.id) {
                <div class="card interview-card" [class.is-upcoming]="interview.isUpcoming">
                  <div class="interview-card-header">
                    <div class="date-badge-col">
                      <span class="date-m">{{ interview.scheduledAt | date:'MMM' }}</span>
                      <span class="date-d">{{ interview.scheduledAt | date:'dd' }}</span>
                      <span class="date-y">{{ interview.scheduledAt | date:'yyyy' }}</span>
                    </div>

                    <div class="main-info-col">
                      <div class="company-round-row">
                        <h3 class="card-company-name">{{ interview.companyName }}</h3>
                        <span class="round-pill">{{ interview.round }}</span>
                      </div>
                      <div class="card-position-name">{{ interview.jobTitle }}</div>
                      <div class="card-meta-line">
                        <span>⏰ {{ interview.scheduledAt | date:'shortTime' }}</span>
                        <span>•</span>
                        <span>📍 {{ interview.type }}</span>
                      </div>
                    </div>

                    <div class="card-menu-col">
                      <button type="button" class="btn-icon" (click)="openEditInterview(interview)" title="Edit interview">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button type="button" class="btn-icon delete-icon" (click)="promptDelete(interview)" title="Delete interview">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </div>

                  @if (interview.notes) {
                    <div class="card-notes-preview">
                      {{ interview.notes }}
                    </div>
                  }

                  <div class="card-footer-actions">
                    <a [routerLink]="['/applications', interview.jobApplicationId]" class="btn btn-secondary btn-sm">
                      View Application
                    </a>
                    @if (interview.meetingUrl) {
                      <a [href]="interview.meetingUrl" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
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
        }

        <!-- Mode 2: Interactive Monthly Calendar View -->
        @if (viewMode === 'calendar') {
          <div class="card calendar-card">
            <!-- Calendar Header: Month Navigation -->
            <div class="calendar-nav-row">
              <div class="current-month-label">
                <h2>{{ currentCalendarMonth | date:'MMMM yyyy' }}</h2>
              </div>
              <div class="cal-nav-buttons">
                <button type="button" class="btn btn-secondary btn-sm" (click)="goToPreviousMonth()">← Prev</button>
                <button type="button" class="btn btn-secondary btn-sm" (click)="goToToday()">Today</button>
                <button type="button" class="btn btn-secondary btn-sm" (click)="goToNextMonth()">Next →</button>
              </div>
            </div>

            <!-- Days of Week Header -->
            <div class="calendar-week-header">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            <!-- Calendar Days Grid -->
            <div class="calendar-grid">
              @for (day of calendarDays; track day.date.toISOString()) {
                <div
                  class="calendar-day-cell"
                  [class.other-month]="!day.isCurrentMonth"
                  [class.is-today]="day.isToday"
                  [class.is-selected]="day.isSelected"
                  (click)="selectDate(day)"
                >
                  <div class="day-number-row">
                    <span class="day-num">{{ day.date.getDate() }}</span>
                    @if (day.events.length > 0) {
                      <span class="event-count-badge">{{ day.events.length }}</span>
                    }
                  </div>

                  <div class="day-events-preview">
                    @for (ev of day.events.slice(0, 2); track ev.id) {
                      <div class="cal-event-pill" (click)="onEventClick($event, ev)">
                        <span class="event-time-short">{{ ev.scheduledAt | date:'h:mm a' }}</span>
                        <span class="event-company-short">{{ ev.companyName }}</span>
                      </div>
                    }
                    @if (day.events.length > 2) {
                      <span class="more-events">+{{ day.events.length - 2 }} more</span>
                    }
                  </div>
                </div>
              }
            </div>

            <!-- Selected Date Events Drawer -->
            @if (selectedCalendarDay) {
              <div class="selected-day-details">
                <div class="selected-day-header">
                  <h4>Schedule for {{ selectedCalendarDay.date | date:'fullDate' }}</h4>
                  <button type="button" class="btn-icon" (click)="selectedCalendarDay = null">✕</button>
                </div>

                @if (selectedCalendarDay.events.length === 0) {
                  <p class="no-events-day">No interviews scheduled on this date.</p>
                } @else {
                  <div class="selected-events-list">
                    @for (ev of selectedCalendarDay.events; track ev.id) {
                      <div class="selected-event-item">
                        <div class="item-info">
                          <strong>{{ ev.companyName }}</strong> — {{ ev.round }} ({{ ev.scheduledAt | date:'shortTime' }})
                          <div class="text-secondary" style="font-size: 13px;">{{ ev.jobTitle }} • {{ ev.type }}</div>
                        </div>
                        <div class="item-actions">
                          <a [routerLink]="['/applications', ev.jobApplicationId]" class="btn btn-secondary btn-sm">View App</a>
                          @if (ev.meetingUrl) {
                            <a [href]="ev.meetingUrl" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">Join</a>
                          }
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            }
          </div>
        }
      }
    </div>

    <!-- Add/Edit Interview Modal -->
    <app-interview-modal
      [isOpen]="isModalOpen"
      [interviewToEdit]="interviewToEdit"
      (close)="isModalOpen = false; interviewToEdit = null"
      (saved)="onInterviewSaved()"
    ></app-interview-modal>

    <!-- Delete Confirmation Modal -->
    <app-confirm-dialog
      [isOpen]="isDeleteModalOpen"
      title="Delete Interview"
      [message]="'Delete this ' + (interviewToDelete?.round || 'interview') + ' with ' + (interviewToDelete?.companyName || '') + '?'"
      subtext="This removes the interview record from your schedule. The application record will remain intact."
      confirmText="Delete Interview"
      cancelText="Cancel"
      [isDestructive]="true"
      [loading]="deleteLoading"
      (confirm)="confirmDelete()"
      (cancel)="isDeleteModalOpen = false; interviewToDelete = null"
    ></app-confirm-dialog>
  `,
  styles: [`
    .interviews-container {
      padding: 32px;
      display: flex;
      flex-direction: column;
      gap: 24px;
      max-width: 1400px;
      width: 100%;
    }

    .interviews-toolbar-card {
      padding: 16px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }

    .time-filter-tabs {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .tab-btn {
      padding: 6px 14px;
      border-radius: var(--radius-control);
      font-size: 13px;
      font-weight: 500;
      color: var(--muted);
      background-color: var(--surface);
      border: 1px solid var(--border);
      cursor: pointer;
      transition: all var(--transition-fast);
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

    .view-mode-toggle {
      display: flex;
      align-items: center;
      border: 1px solid var(--border);
      border-radius: var(--radius-control);
      background-color: var(--surface);
      padding: 2px;
    }

    .toggle-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      border-radius: var(--radius-chip);
      font-size: 13px;
      font-weight: 500;
      color: var(--muted);
      background: transparent;
      border: none;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .toggle-btn:hover {
      color: var(--text);
      background-color: var(--raised);
    }

    .toggle-btn.active {
      background-color: var(--active);
      color: var(--text);
      font-weight: 600;
      box-shadow: none;
    }

    /* List View Cards */
    .interviews-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
      gap: 20px;
    }

    .interview-card {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      transition: all var(--transition-fast);
    }

    .interview-card.is-upcoming {
      border-color: var(--border-strong);
    }

    .interview-card:hover {
      border-color: var(--primary);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .interview-card-header {
      display: flex;
      align-items: flex-start;
      gap: 14px;
    }

    .date-badge-col {
      width: 52px;
      height: 58px;
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

    .date-m { font-size: 11px; text-transform: uppercase; color: var(--muted); font-weight: 600; }
    .date-d { font-size: 18px; color: var(--text); font-weight: 700; }
    .date-y { font-size: 10px; color: var(--faint); }

    .main-info-col {
      flex: 1;
      min-width: 0;
    }

    .company-round-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 2px;
    }

    .card-company-name {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-main);
    }

    .round-pill {
      font-size: 11.5px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: var(--radius-full);
      background-color: var(--bg-app);
      border: 1px solid var(--border-main);
      color: var(--text-secondary);
    }

    .card-position-name {
      font-size: 13.5px;
      color: var(--text-secondary);
      margin-bottom: 6px;
    }

    .card-meta-line {
      font-size: 12.5px;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .card-menu-col {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .delete-icon:hover {
      color: #ef4444;
      background-color: #fef2f2;
    }

    .card-notes-preview {
      font-size: 13px;
      color: var(--text-secondary);
      background-color: var(--bg-app);
      padding: 8px 12px;
      border-radius: var(--radius-sm);
      line-height: 1.4;
    }

    .card-footer-actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 10px;
      margin-top: auto;
      padding-top: 10px;
      border-top: 1px solid var(--border-light);
    }

    /* Calendar View */
    .calendar-card {
      padding: 24px;
    }

    .calendar-nav-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }

    .current-month-label h2 {
      font-size: 20px;
      font-weight: 700;
      color: var(--text-main);
    }

    .cal-nav-buttons {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .calendar-week-header {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      text-align: center;
      font-size: 12.5px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border-main);
    }

    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 4px;
      margin-top: 8px;
    }

    .calendar-day-cell {
      min-height: 100px;
      background-color: var(--bg-surface);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-sm);
      padding: 8px;
      display: flex;
      flex-direction: column;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .calendar-day-cell:hover {
      border-color: var(--border-strong);
      background-color: var(--bg-app);
    }

    .calendar-day-cell.other-month {
      opacity: 0.35;
    }

    .calendar-day-cell.is-today {
      border-color: var(--accent);
      background-color: var(--raised);
    }

    .calendar-day-cell.is-selected {
      border-color: var(--primary);
      background-color: var(--active);
    }

    .day-number-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12.5px;
      font-weight: 600;
      margin-bottom: 6px;
    }

    .event-count-badge {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background-color: var(--primary);
      color: var(--primary-ink);
      font-size: 11px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .day-events-preview {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .cal-event-pill {
      font-size: 11.5px;
      background-color: var(--surface);
      border: 1px solid var(--border);
      padding: 2px 6px;
      border-radius: var(--radius-chip);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: var(--text);
    }

    .cal-event-pill:hover {
      background-color: var(--raised);
      color: var(--text);
      border-color: var(--control);
    }

    .event-time-short {
      font-weight: 600;
      margin-right: 4px;
    }

    .more-events {
      font-size: 10.5px;
      color: var(--text-muted);
      font-weight: 600;
    }

    /* Selected Day Details */
    .selected-day-details {
      margin-top: 24px;
      padding: 18px;
      border-radius: var(--radius-md);
      background-color: var(--bg-app);
      border: 1px solid var(--border-main);
    }

    .selected-day-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
    }

    .selected-day-header h4 {
      font-size: 15px;
      font-weight: 600;
    }

    .no-events-day {
      font-size: 13.5px;
      color: var(--text-muted);
    }

    .selected-events-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .selected-event-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      background-color: var(--bg-surface);
      border-radius: var(--radius-md);
      border: 1px solid var(--border-main);
    }

    .item-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Empty state card */
    .empty-state-card {
      padding: 56px 20px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .empty-icon-circle {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background-color: var(--raised);
      border: 1px solid var(--border);
      color: var(--text);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    @media (max-width: 640px) {
      .interviews-container {
        padding: 20px 16px;
      }
      .interviews-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class InterviewListComponent implements OnInit {
  private interviewService = inject(InterviewService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  interviews: Interview[] = [];
  loading = true;
  error = '';
  selectedTab: 'upcoming' | 'past' | 'all' = 'upcoming';
  viewMode: 'list' | 'calendar' = 'list';

  // Calendar State
  currentCalendarMonth = new Date();
  calendarDays: CalendarDay[] = [];
  selectedCalendarDay: CalendarDay | null = null;

  // Modal State
  isModalOpen = false;
  interviewToEdit: Interview | null = null;

  isDeleteModalOpen = false;
  deleteLoading = false;
  interviewToDelete: Interview | null = null;

  ngOnInit(): void {
    this.loadInterviews();
  }

  loadInterviews(): void {
    this.loading = true;
    this.error = '';

    this.interviewService.getInterviews(this.selectedTab).subscribe({
      next: (data) => {
        this.interviews = data;
        this.loading = false;
        if (this.viewMode === 'calendar') {
          this.buildCalendar();
        }
      },
      error: () => {
        this.error = 'Failed to load interviews schedule.';
        this.loading = false;
      }
    });
  }

  selectTab(tab: 'upcoming' | 'past' | 'all'): void {
    this.selectedTab = tab;
    this.loadInterviews();
  }

  switchToCalendar(): void {
    this.viewMode = 'calendar';
    this.buildCalendar();
  }

  buildCalendar(): void {
    const year = this.currentCalendarMonth.getFullYear();
    const month = this.currentCalendarMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startOffset = firstDay.getDay(); // 0 is Sunday
    const totalDaysInMonth = lastDay.getDate();

    const days: CalendarDay[] = [];
    const today = new Date();

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date: d,
        isCurrentMonth: false,
        isToday: this.isSameDay(d, today),
        isSelected: false,
        events: this.getEventsForDay(d)
      });
    }

    // Current month days
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const d = new Date(year, month, day);
      days.push({
        date: d,
        isCurrentMonth: true,
        isToday: this.isSameDay(d, today),
        isSelected: false,
        events: this.getEventsForDay(d)
      });
    }

    // Next month padding to fill complete grid of 35 or 42
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({
        date: d,
        isCurrentMonth: false,
        isToday: this.isSameDay(d, today),
        isSelected: false,
        events: this.getEventsForDay(d)
      });
    }

    this.calendarDays = days;
  }

  goToPreviousMonth(): void {
    this.currentCalendarMonth = new Date(this.currentCalendarMonth.getFullYear(), this.currentCalendarMonth.getMonth() - 1, 1);
    this.buildCalendar();
  }

  goToNextMonth(): void {
    this.currentCalendarMonth = new Date(this.currentCalendarMonth.getFullYear(), this.currentCalendarMonth.getMonth() + 1, 1);
    this.buildCalendar();
  }

  goToToday(): void {
    this.currentCalendarMonth = new Date();
    this.buildCalendar();
  }

  selectDate(day: CalendarDay): void {
    this.calendarDays.forEach(d => d.isSelected = false);
    day.isSelected = true;
    this.selectedCalendarDay = day;
  }

  onEventClick(event: MouseEvent, ev: Interview): void {
    event.stopPropagation();
    this.router.navigate(['/applications', ev.jobApplicationId]);
  }

  openAddInterview(): void {
    this.interviewToEdit = null;
    this.isModalOpen = true;
  }

  openEditInterview(interview: Interview): void {
    this.interviewToEdit = interview;
    this.isModalOpen = true;
  }

  onInterviewSaved(): void {
    this.loadInterviews();
  }

  promptDelete(interview: Interview): void {
    this.interviewToDelete = interview;
    this.isDeleteModalOpen = true;
  }

  confirmDelete(): void {
    if (!this.interviewToDelete) return;
    this.deleteLoading = true;

    this.interviewService.delete(this.interviewToDelete.id).subscribe({
      next: (res) => {
        this.deleteLoading = false;
        this.isDeleteModalOpen = false;
        this.interviewToDelete = null;
        this.toastService.success(res.message || 'Interview deleted successfully.');
        this.loadInterviews();
      },
      error: (err) => {
        this.deleteLoading = false;
        this.toastService.error(err.error?.message || 'Failed to delete interview.');
      }
    });
  }

  private isSameDay(d1: Date, d2: Date): boolean {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }

  private getEventsForDay(date: Date): Interview[] {
    return this.interviews.filter(ev => {
      const evDate = new Date(ev.scheduledAt);
      return this.isSameDay(evDate, date);
    });
  }
}

import { Component, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InterviewService } from '../../../core/services/interview.service';
import { ApplicationService } from '../../../core/services/application.service';
import { ToastService } from '../../../core/services/toast.service';
import { ApplicationLookup } from '../../../core/models/application.model';
import { CreateInterviewRequest, Interview, UpdateInterviewRequest } from '../../../core/models/interview.model';

@Component({
  selector: 'app-interview-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    @if (isOpen) {
      <div class="modal-backdrop" (click)="onBackdropClick($event)" role="dialog" aria-modal="true" aria-labelledby="interview-modal-title">
        <div class="modal-dialog">
          <div class="modal-header">
            <div>
              <span class="modal-badge">{{ isEditMode ? 'Update' : 'Schedule' }}</span>
              <h3 class="modal-title" id="interview-modal-title">
                {{ isEditMode ? 'Edit Interview' : 'Add Interview' }}
              </h3>
            </div>
            <button class="btn-icon" (click)="close.emit()" aria-label="Close dialog">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <form [formGroup]="interviewForm" (ngSubmit)="onSubmit()" novalidate>
            <div class="modal-body">
              <!-- Application Selector (only if not pre-locked to an application) -->
              @if (!lockedApplicationId) {
                <div class="form-group">
                  <label class="form-label" for="int-app-select">
                    Job Application <span class="required">*</span>
                  </label>
                  <select id="int-app-select" class="form-control" formControlName="jobApplicationId">
                    <option [ngValue]="null" disabled>Select application...</option>
                    @for (app of applicationsList; track app.id) {
                      <option [ngValue]="app.id">{{ app.displayText }}</option>
                    }
                  </select>
                  @if (isFieldInvalid('jobApplicationId')) {
                    <span class="form-error">Please select a job application.</span>
                  }
                </div>
              } @else {
                <div class="locked-app-info">
                  <span class="locked-label">Target Application:</span>
                  <span class="locked-title">{{ lockedApplicationTitle }}</span>
                </div>
              }

              <!-- Round & Type -->
              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label" for="int-round">
                    Interview round <span class="required">*</span>
                  </label>
                  <select id="int-round" class="form-control" formControlName="round">
                    <option value="Screening">Screening</option>
                    <option value="Technical">Technical</option>
                    <option value="HR">HR</option>
                    <option value="Managerial">Managerial</option>
                    <option value="Final">Final</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label" for="int-type">
                    Interview type <span class="required">*</span>
                  </label>
                  <select id="int-type" class="form-control" formControlName="type">
                    <option value="Video call">Video call</option>
                    <option value="Phone call">Phone call</option>
                    <option value="In person">In person</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <!-- Date and Time -->
              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label" for="int-date">
                    Date <span class="required">*</span>
                  </label>
                  <input
                    id="int-date"
                    type="date"
                    class="form-control"
                    [class.is-invalid]="isFieldInvalid('date')"
                    formControlName="date"
                  />
                  @if (isFieldInvalid('date')) {
                    <span class="form-error">Date is required.</span>
                  }
                </div>

                <div class="form-group">
                  <label class="form-label" for="int-time">
                    Time <span class="required">*</span>
                  </label>
                  <input
                    id="int-time"
                    type="time"
                    class="form-control"
                    [class.is-invalid]="isFieldInvalid('time')"
                    formControlName="time"
                  />
                  @if (isFieldInvalid('time')) {
                    <span class="form-error">Time is required.</span>
                  }
                </div>
              </div>

              <!-- Meeting URL -->
              <div class="form-group">
                <label class="form-label" for="int-url">
                  Meeting URL <span class="optional-tag">(Optional)</span>
                </label>
                <input
                  id="int-url"
                  type="url"
                  class="form-control"
                  [class.is-invalid]="isFieldInvalid('meetingUrl')"
                  formControlName="meetingUrl"
                  placeholder="https://meet.google.com/... or Zoom link"
                />
                @if (isFieldInvalid('meetingUrl')) {
                  <span class="form-error">Please enter a valid URL.</span>
                }
              </div>

              <!-- Notes -->
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label" for="int-notes">
                  Notes <span class="optional-tag">(Optional)</span>
                </label>
                <textarea
                  id="int-notes"
                  rows="3"
                  class="form-control"
                  formControlName="notes"
                  placeholder="Interviewer names, topics to cover, preparation notes..."
                ></textarea>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="close.emit()" [disabled]="saving">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" [disabled]="saving">
                @if (saving) {
                  <span class="spinner"></span>
                  Saving...
                } @else {
                  Save Interview
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-badge {
      font-size: 11px;
      font-weight: 700;
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .locked-app-info {
      padding: 10px 14px;
      border-radius: var(--radius-control);
      background-color: var(--raised);
      border: 1px solid var(--border);
      margin-bottom: 16px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .locked-label {
      font-size: 11.5px;
      font-weight: 600;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .locked-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text);
    }
    .form-row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .optional-tag {
      font-size: 12px;
      color: var(--text-muted);
      font-weight: 400;
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
      .form-row-2 {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class InterviewModalComponent implements OnChanges {
  private fb = inject(FormBuilder);
  private interviewService = inject(InterviewService);
  private applicationService = inject(ApplicationService);
  private toastService = inject(ToastService);

  @Input() isOpen = false;
  @Input() interviewToEdit: Interview | null = null;
  @Input() lockedApplicationId: number | null = null;
  @Input() lockedApplicationTitle = '';

  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Interview>();

  isEditMode = false;
  saving = false;
  applicationsList: ApplicationLookup[] = [];

  interviewForm: FormGroup = this.fb.group({
    jobApplicationId: [null, [Validators.required]],
    round: ['Technical', [Validators.required]],
    type: ['Video call', [Validators.required]],
    date: ['', [Validators.required]],
    time: ['11:00', [Validators.required]],
    meetingUrl: ['', [Validators.pattern('https?://.+')]],
    notes: ['']
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      this.initForm();
      if (!this.lockedApplicationId) {
        this.loadApplicationLookup();
      }
    }
  }

  isFieldInvalid(field: string): boolean {
    const ctrl = this.interviewForm.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  @HostListener('document:keydown.escape')
  handleEscape() {
    if (this.isOpen && !this.saving) {
      this.close.emit();
    }
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop') && !this.saving) {
      this.close.emit();
    }
  }

  private loadApplicationLookup() {
    this.applicationService.getLookup().subscribe({
      next: (apps) => {
        this.applicationsList = apps;
      }
    });
  }

  private initForm() {
    if (this.interviewToEdit) {
      this.isEditMode = true;
      const scheduled = new Date(this.interviewToEdit.scheduledAt);
      const datePart = scheduled.toISOString().substring(0, 10);
      const timePart = scheduled.toTimeString().substring(0, 5);

      this.interviewForm.patchValue({
        jobApplicationId: this.interviewToEdit.jobApplicationId,
        round: this.interviewToEdit.round,
        type: this.interviewToEdit.type,
        date: datePart,
        time: timePart,
        meetingUrl: this.interviewToEdit.meetingUrl || '',
        notes: this.interviewToEdit.notes || ''
      });
    } else {
      this.isEditMode = false;
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const defaultDate = tomorrow.toISOString().substring(0, 10);

      this.interviewForm.reset({
        jobApplicationId: this.lockedApplicationId || null,
        round: 'Technical',
        type: 'Video call',
        date: defaultDate,
        time: '11:00',
        meetingUrl: '',
        notes: ''
      });
    }
  }

  onSubmit() {
    if (this.lockedApplicationId) {
      this.interviewForm.patchValue({ jobApplicationId: this.lockedApplicationId });
    }

    if (this.interviewForm.invalid) {
      this.interviewForm.markAllAsTouched();
      return;
    }

    const val = this.interviewForm.value;
    const combinedScheduledAt = new Date(`${val.date}T${val.time}:00Z`).toISOString();

    this.saving = true;

    if (this.isEditMode && this.interviewToEdit) {
      const updateReq: UpdateInterviewRequest = {
        round: val.round,
        type: val.type,
        scheduledAt: combinedScheduledAt,
        meetingUrl: val.meetingUrl?.trim() || undefined,
        notes: val.notes?.trim() || undefined
      };

      this.interviewService.update(this.interviewToEdit.id, updateReq).subscribe({
        next: (res) => {
          this.saving = false;
          this.toastService.success(res.message || 'Interview updated successfully.');
          this.saved.emit(res.data);
          this.close.emit();
        },
        error: (err) => {
          this.saving = false;
          this.toastService.error(err.error?.message || 'Failed to update interview.');
        }
      });
    } else {
      const createReq: CreateInterviewRequest = {
        jobApplicationId: Number(val.jobApplicationId),
        round: val.round,
        type: val.type,
        scheduledAt: combinedScheduledAt,
        meetingUrl: val.meetingUrl?.trim() || undefined,
        notes: val.notes?.trim() || undefined
      };

      this.interviewService.create(createReq).subscribe({
        next: (res) => {
          this.saving = false;
          if (res.hasOverlapWarning) {
            this.toastService.info('Note: Another interview is scheduled close to this time.');
          } else {
            this.toastService.success(res.message || 'Interview scheduled successfully.');
          }
          this.saved.emit(res.data);
          this.close.emit();
        },
        error: (err) => {
          this.saving = false;
          this.toastService.error(err.error?.message || 'Failed to schedule interview.');
        }
      });
    }
  }
}

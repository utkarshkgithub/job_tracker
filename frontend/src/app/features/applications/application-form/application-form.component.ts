import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ApplicationService } from '../../../core/services/application.service';
import { ToastService } from '../../../core/services/toast.service';
import { CreateJobApplicationRequest, UpdateJobApplicationRequest } from '../../../core/models/application.model';

@Component({
  selector: 'app-application-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HeaderComponent, ConfirmDialogComponent],
  template: `
    <app-header
      [title]="isEditMode ? 'Edit Application' : 'Add Application'"
      [subtitle]="isEditMode ? 'Modify details for this job application.' : 'Record a job you\\'ve applied for in under 30 seconds.'"
    >
      <div header-actions>
        <button type="button" class="btn btn-secondary" (click)="onCancel()">
          Cancel
        </button>
      </div>
    </app-header>

    <div class="form-container">
      @if (loadingExisting) {
        <div class="card form-card">
          <div class="skeleton" style="width: 140px; height: 18px; margin-bottom: 24px;"></div>
          <div class="skeleton" style="width: 100%; height: 42px; margin-bottom: 20px;"></div>
          <div class="skeleton" style="width: 100%; height: 42px; margin-bottom: 20px;"></div>
          <div class="skeleton" style="width: 100%; height: 42px;"></div>
        </div>
      } @else {
        <div class="card form-card">
          <form [formGroup]="appForm" (ngSubmit)="onSubmit()" novalidate>
            <!-- Section 1: Job Details -->
            <div class="form-section-header">
              <span class="section-badge">Step 1</span>
              <h3 class="section-title">Job Details</h3>
            </div>

            <div class="form-group">
              <label class="form-label" for="company-name">
                Company name <span class="required">*</span>
              </label>
              <input
                id="company-name"
                type="text"
                class="form-control"
                [class.is-invalid]="isFieldInvalid('companyName')"
                formControlName="companyName"
                placeholder="e.g. Stripe, Google, Linear"
                autocomplete="organization"
              />
              @if (isFieldInvalid('companyName')) {
                <span class="form-error">Company name is required.</span>
              }
            </div>

            <div class="form-group">
              <label class="form-label" for="job-title">
                Job title <span class="required">*</span>
              </label>
              <input
                id="job-title"
                type="text"
                class="form-control"
                [class.is-invalid]="isFieldInvalid('jobTitle')"
                formControlName="jobTitle"
                placeholder="e.g. Senior Backend Engineer"
                autocomplete="organization-title"
              />
              @if (isFieldInvalid('jobTitle')) {
                <span class="form-error">Job title is required.</span>
              }
            </div>

            <div class="form-group">
              <label class="form-label" for="job-url">
                Job posting URL <span class="optional-tag">(Optional)</span>
              </label>
              <input
                id="job-url"
                type="url"
                class="form-control"
                [class.is-invalid]="isFieldInvalid('jobPostingUrl')"
                formControlName="jobPostingUrl"
                placeholder="https://company.com/careers/role"
              />
              @if (isFieldInvalid('jobPostingUrl')) {
                <span class="form-error">Please enter a valid URL (e.g. https://...).</span>
              }
            </div>

            <div class="form-divider"></div>

            <!-- Section 2: Application Details -->
            <div class="form-section-header">
              <span class="section-badge">Step 2</span>
              <h3 class="section-title">Application Status & Dates</h3>
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label" for="app-date">
                  Application date <span class="required">*</span>
                </label>
                <input
                  id="app-date"
                  type="date"
                  class="form-control"
                  [class.is-invalid]="isFieldInvalid('applicationDate')"
                  formControlName="applicationDate"
                />
                @if (isFieldInvalid('applicationDate')) {
                  <span class="form-error">Valid application date is required.</span>
                }
              </div>

              <div class="form-group">
                <label class="form-label" for="app-status">
                  Status <span class="required">*</span>
                </label>
                <select id="app-status" class="form-control" formControlName="status">
                  <option [ngValue]="0">Applied</option>
                  <option [ngValue]="1">Assessment</option>
                  <option [ngValue]="2">Interview</option>
                  <option [ngValue]="3">Offer</option>
                  <option [ngValue]="4">Rejected</option>
                  <option [ngValue]="5">Withdrawn</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="app-notes">
                Notes <span class="optional-tag">(Optional)</span>
              </label>
              <textarea
                id="app-notes"
                rows="4"
                class="form-control"
                formControlName="notes"
                placeholder="Key requirements, referral details, recruiter contact, interview prep notes..."
              ></textarea>
              <span class="form-hint">Maximum 2,000 characters</span>
            </div>

            <!-- Action Buttons -->
            <div class="form-actions-footer">
              <button type="button" class="btn btn-secondary" (click)="onCancel()">
                Cancel
              </button>
              <button
                type="submit"
                id="save-application-btn"
                class="btn btn-primary"
                [disabled]="saving"
              >
                @if (saving) {
                  <span class="spinner"></span>
                  Saving...
                } @else {
                  {{ isEditMode ? 'Save Changes' : 'Save Application' }}
                }
              </button>
            </div>
          </form>
        </div>
      }
    </div>

    <!-- Discard Changes Confirmation Dialog -->
    <app-confirm-dialog
      [isOpen]="isDiscardModalOpen"
      title="Discard unsaved changes?"
      message="You have unsaved changes. Are you sure you want to discard them and leave?"
      confirmText="Discard changes"
      cancelText="Keep editing"
      [isDestructive]="true"
      (confirm)="confirmDiscard()"
      (cancel)="isDiscardModalOpen = false"
    ></app-confirm-dialog>
  `,
  styles: [`
    .form-container {
      padding: 32px;
      display: flex;
      justify-content: center;
      width: 100%;
    }

    .form-card {
      width: 100%;
      max-width: 680px;
      padding: 36px;
    }

    .form-section-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 18px;
    }

    .section-badge {
      font-size: 11px;
      font-weight: 700;
      color: var(--primary);
      background-color: var(--primary-light);
      padding: 3px 8px;
      border-radius: var(--radius-full);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .section-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-main);
    }

    .optional-tag {
      font-size: 12px;
      font-weight: 400;
      color: var(--text-muted);
    }

    .form-divider {
      height: 1px;
      background-color: var(--border-light);
      margin: 24px 0 20px;
    }

    .form-row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .form-actions-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 28px;
      padding-top: 20px;
      border-top: 1px solid var(--border-light);
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

    @media (max-width: 640px) {
      .form-container {
        padding: 20px 16px;
      }
      .form-card {
        padding: 24px 18px;
      }
      .form-row-2 {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ApplicationFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private applicationService = inject(ApplicationService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEditMode = false;
  applicationId: number | null = null;
  loadingExisting = false;
  saving = false;
  isDiscardModalOpen = false;

  appForm: FormGroup = this.fb.group({
    companyName: ['', [Validators.required, Validators.maxLength(150)]],
    jobTitle: ['', [Validators.required, Validators.maxLength(150)]],
    jobPostingUrl: ['', [Validators.pattern('https?://.+')]],
    applicationDate: [new Date().toISOString().substring(0, 10), [Validators.required]],
    status: [0, [Validators.required]],
    notes: ['', [Validators.maxLength(2000)]]
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.applicationId = parseInt(idParam, 10);
      this.loadExistingData(this.applicationId);
    }
  }

  isFieldInvalid(field: string): boolean {
    const ctrl = this.appForm.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  loadExistingData(id: number): void {
    this.loadingExisting = true;
    this.applicationService.getById(id).subscribe({
      next: (app) => {
        this.loadingExisting = false;
        const statusMap: Record<string, number> = {
          'Applied': 0,
          'Assessment': 1,
          'Interview': 2,
          'Offer': 3,
          'Rejected': 4,
          'Withdrawn': 5
        };
        const statusVal = typeof app.status === 'number' ? app.status : (statusMap[app.status] ?? 0);

        this.appForm.patchValue({
          companyName: app.companyName,
          jobTitle: app.jobTitle,
          jobPostingUrl: app.jobPostingUrl || '',
          applicationDate: app.applicationDate ? app.applicationDate.substring(0, 10) : '',
          status: statusVal,
          notes: app.notes || ''
        });
        this.appForm.markAsPristine();
      },
      error: () => {
        this.loadingExisting = false;
        this.toastService.error('Application not found or unauthorized.');
        this.router.navigate(['/applications']);
      }
    });
  }

  onCancel(): void {
    if (this.appForm.dirty) {
      this.isDiscardModalOpen = true;
    } else {
      this.navigateBack();
    }
  }

  confirmDiscard(): void {
    this.isDiscardModalOpen = false;
    this.navigateBack();
  }

  private navigateBack(): void {
    if (this.isEditMode && this.applicationId) {
      this.router.navigate(['/applications', this.applicationId]);
    } else {
      this.router.navigate(['/applications']);
    }
  }

  onSubmit(): void {
    if (this.appForm.invalid) {
      this.appForm.markAllAsTouched();
      return;
    }

    const val = this.appForm.value;
    const trimmedCompany = val.companyName.trim();
    const trimmedTitle = val.jobTitle.trim();

    if (!trimmedCompany || !trimmedTitle) {
      this.toastService.error('Company name and job title cannot be whitespace only.');
      return;
    }

    this.saving = true;

    if (this.isEditMode && this.applicationId) {
      const updateReq: UpdateJobApplicationRequest = {
        companyName: trimmedCompany,
        jobTitle: trimmedTitle,
        jobPostingUrl: val.jobPostingUrl?.trim() || undefined,
        applicationDate: new Date(val.applicationDate).toISOString(),
        status: Number(val.status),
        notes: val.notes?.trim() || undefined
      };

      this.applicationService.update(this.applicationId, updateReq).subscribe({
        next: (res) => {
          this.saving = false;
          this.toastService.success(res.message || 'Application updated successfully.');
          this.router.navigate(['/applications', this.applicationId]);
        },
        error: (err) => {
          this.saving = false;
          this.toastService.error(err.error?.message || 'Failed to update application.');
        }
      });
    } else {
      const createReq: CreateJobApplicationRequest = {
        companyName: trimmedCompany,
        jobTitle: trimmedTitle,
        jobPostingUrl: val.jobPostingUrl?.trim() || undefined,
        applicationDate: new Date(val.applicationDate).toISOString(),
        status: Number(val.status),
        notes: val.notes?.trim() || undefined
      };

      this.applicationService.create(createReq).subscribe({
        next: (res) => {
          this.saving = false;
          if (res.isDuplicateWarning) {
            this.toastService.info('Note: You already have an application for a similar position at this company.');
          } else {
            this.toastService.success(res.message || 'Application added successfully.');
          }
          this.router.navigate(['/applications', res.data.id]);
        },
        error: (err) => {
          this.saving = false;
          this.toastService.error(err.error?.message || 'Failed to create application.');
        }
      });
    }
  }
}

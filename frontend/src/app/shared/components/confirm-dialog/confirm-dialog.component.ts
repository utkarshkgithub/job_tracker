import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div class="modal-backdrop" (click)="onBackdropClick($event)" role="dialog" aria-modal="true" [attr.aria-labelledby]="'dialog-title'">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3 class="modal-title" id="dialog-title">{{ title }}</h3>
            <button class="btn-icon" (click)="cancel.emit()" aria-label="Close dialog">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <p class="confirm-message">{{ message }}</p>
            @if (subtext) {
              <p class="confirm-subtext">{{ subtext }}</p>
            }
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="cancel.emit()">
              {{ cancelText }}
            </button>
            <button
              type="button"
              class="btn"
              [ngClass]="isDestructive ? 'btn-destructive' : 'btn-primary'"
              [disabled]="loading"
              (click)="confirm.emit()"
            >
              @if (loading) {
                <span class="spinner"></span>
              }
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .confirm-message {
      font-size: 15px;
      color: var(--text-main);
      margin-bottom: 8px;
      font-weight: 500;
    }
    .confirm-subtext {
      font-size: 13.5px;
      color: var(--text-secondary);
      line-height: 1.5;
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
  `]
})
export class ConfirmDialogComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to proceed?';
  @Input() subtext = '';
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';
  @Input() isDestructive = false;
  @Input() loading = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  @HostListener('document:keydown.escape', ['$event'])
  handleEscape(event: KeyboardEvent) {
    if (this.isOpen && !this.loading) {
      this.cancel.emit();
    }
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop') && !this.loading) {
      this.cancel.emit();
    }
  }
}

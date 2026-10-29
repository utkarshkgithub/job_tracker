import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-help-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div class="modal-backdrop" (click)="onBackdropClick($event)" role="dialog" aria-modal="true" aria-labelledby="help-title">
        <div class="modal-dialog">
          <div class="modal-header">
            <div class="header-title-row">
              <div class="help-badge">Support & Guide</div>
              <h3 class="modal-title" id="help-title">CareerFlow Help Center</h3>
            </div>
            <button class="btn-icon" (click)="close.emit()" aria-label="Close help">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="guide-section">
              <h4>Quick Workflow Guide</h4>
              <ol class="workflow-steps">
                <li><strong>Add Application:</strong> Record your job application with company, position, date, and status in under 30 seconds.</li>
                <li><strong>Schedule Interviews:</strong> Click into any application or open Interviews to log upcoming technical, screening, or HR rounds with meeting links.</li>
                <li><strong>Update Progress:</strong> Easily update statuses (Applied → Assessment → Interview → Offer) as hiring cycles advance.</li>
                <li><strong>Track Trends:</strong> Review deep conversion funnels and status charts on the Analytics page.</li>
              </ol>
            </div>

            <div class="guide-section">
              <h4>Keyboard Shortcuts</h4>
              <div class="shortcuts-grid">
                <div class="shortcut-item">
                  <kbd>Esc</kbd>
                  <span>Close dialogs & popovers</span>
                </div>
                <div class="shortcut-item">
                  <kbd>Tab</kbd>
                  <span>Navigate controls smoothly</span>
                </div>
                <div class="shortcut-item">
                  <kbd>Enter</kbd>
                  <span>Submit forms & select actions</span>
                </div>
              </div>
            </div>

            <div class="guide-section support-box">
              <h4>Need further assistance?</h4>
              <p>For questions, feature feedback, or technical support, contact the team at <a href="mailto:support@careerflow.dev">support&#64;careerflow.dev</a>.</p>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" (click)="close.emit()">Got it</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .header-title-row {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .help-badge {
      font-size: 11px;
      font-weight: 600;
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .guide-section {
      margin-bottom: 24px;
    }
    .guide-section h4 {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 12px;
      color: var(--text-main);
    }
    .workflow-steps {
      padding-left: 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      font-size: 13.5px;
      color: var(--text-secondary);
      line-height: 1.5;
    }
    .workflow-steps strong {
      color: var(--text-main);
    }
    .shortcuts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 10px;
    }
    .shortcut-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      background-color: var(--bg-surface-hover);
      border-radius: var(--radius-sm);
      font-size: 13px;
      color: var(--text-secondary);
    }
    kbd {
      background-color: var(--bg-surface);
      border: 1px solid var(--border-main);
      box-shadow: 0 1px 1px rgba(0,0,0,0.1);
      border-radius: 4px;
      padding: 2px 6px;
      font-size: 11px;
      font-weight: 600;
      color: var(--text-main);
    }
    .support-box {
      padding: 14px 16px;
      background-color: var(--primary-light);
      border-radius: var(--radius-md);
      margin-bottom: 0;
    }
    .support-box h4 {
      color: var(--primary);
      margin-bottom: 4px;
    }
    .support-box p {
      font-size: 13px;
      color: var(--text-secondary);
      margin: 0;
    }
  `]
})
export class HelpModalComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  handleEscape() {
    if (this.isOpen) {
      this.close.emit();
    }
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close.emit();
    }
  }
}

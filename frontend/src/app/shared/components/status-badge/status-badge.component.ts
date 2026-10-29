import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApplicationStatus } from '../../../core/models/application.model';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [ngClass]="badgeClass">
      <span class="status-dot"></span>
      {{ statusName }}
    </span>
  `,
  styles: [`
    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: currentColor;
    }
  `]
})
export class StatusBadgeComponent {
  @Input() status: number | ApplicationStatus | string = 'Applied';

  get statusName(): string {
    if (typeof this.status === 'number') {
      const map: Record<number, string> = {
        0: 'Applied',
        1: 'Assessment',
        2: 'Interview',
        3: 'Offer',
        4: 'Rejected',
        5: 'Withdrawn'
      };
      return map[this.status] || 'Applied';
    }
    return String(this.status);
  }

  get badgeClass(): string {
    return `badge-${this.statusName.toLowerCase()}`;
  }
}

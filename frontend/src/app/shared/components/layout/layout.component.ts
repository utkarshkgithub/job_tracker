import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HelpModalComponent } from '../help-modal/help-modal.component';
import { UiService } from '../../../core/services/ui.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HelpModalComponent],
  template: `
    <div class="app-layout">
      <app-sidebar
        [isOpen]="uiService.isMobileSidebarOpen()"
        (closeSidebar)="uiService.closeMobileSidebar()"
        (openHelp)="uiService.openHelp()"
      ></app-sidebar>

      <main class="main-content">
        <router-outlet></router-outlet>
      </main>

      <app-help-modal
        [isOpen]="uiService.isHelpModalOpen()"
        (close)="uiService.closeHelp()"
      ></app-help-modal>
    </div>
  `,
  styles: [`
    .app-layout {
      min-height: 100dvh;
      display: flex;
      background-color: var(--ground);
      color: var(--text);
    }

    .main-content {
      flex: 1;
      margin-left: 230px;
      min-height: 100dvh;
      display: flex;
      flex-direction: column;
      background-color: var(--ground);
      transition: margin-left 0.2s ease;
      min-width: 0;
    }

    @media (max-width: 900px) {
      .main-content {
        margin-left: 0;
      }
    }
  `]
})
export class LayoutComponent {
  readonly uiService = inject(UiService);
}

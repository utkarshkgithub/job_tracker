import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UiService {
  readonly isMobileSidebarOpen = signal(false);
  readonly isHelpModalOpen = signal(false);

  toggleMobileSidebar() {
    this.isMobileSidebarOpen.update(v => !v);
  }

  closeMobileSidebar() {
    this.isMobileSidebarOpen.set(false);
  }

  openMobileSidebar() {
    this.isMobileSidebarOpen.set(true);
  }

  openHelp() {
    this.isHelpModalOpen.set(true);
  }

  closeHelp() {
    this.isHelpModalOpen.set(false);
  }

  toggleHelp() {
    this.isHelpModalOpen.update(v => !v);
  }
}

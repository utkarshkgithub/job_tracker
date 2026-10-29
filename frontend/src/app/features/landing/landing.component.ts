import { Component, computed, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface DemoCard {
  id: string;
  company: string;
  role: string;
  status: 'Applied' | 'Interview' | 'Offer';
  date: string;
  salary: string;
  nextStep: string;
  isNew?: boolean;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="landing-page">
      <!-- Public Header Navigation -->
      <header class="landing-header">
        <div class="header-container">
          <a routerLink="/" class="brand-logo" aria-label="CareerFlow Home">
            <span class="logo-mark">C</span>
            <span class="brand-name">CareerFlow</span>
          </a>

          <nav class="nav-links">
            <a href="#pipeline" class="nav-link">Interactive Pipeline</a>
            <a href="#features" class="nav-link">Features</a>
            <a href="#funnel" class="nav-link">Live Funnel</a>
            <a href="#comparison" class="nav-link">Comparison</a>
          </nav>

          <div class="header-actions">
            <!-- Theme Toggle -->
            <button
              type="button"
              class="btn-theme"
              (click)="toggleTheme()"
              [attr.aria-label]="isDark() ? 'Switch to light mode' : 'Switch to dark mode'"
            >
              @if (isDark()) {
                <svg class="theme-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              } @else {
                <svg class="theme-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              }
            </button>

            @if (isAuthenticated()) {
              <a routerLink="/dashboard" class="btn btn-primary btn-sm">Dashboard →</a>
            } @else {
              <a routerLink="/login" class="btn btn-secondary btn-sm">Sign in</a>
              <a routerLink="/register" class="btn btn-primary btn-sm">Get started</a>
            }
          </div>
        </div>
      </header>

      <!-- Hero Section with Motion Choreography -->
      <section class="hero-section">
        <div class="hero-content">
          <!-- Dominant Display Headline -->
          <h1 class="hero-headline animate-in-1">
            Track applications.<br>
            <span class="headline-accent">Master interviews.</span>
          </h1>

          <p class="hero-subline animate-in-2">
            An open, structured career workspace that replaces scattered spreadsheets with
            real-time conversion funnels, conflict-free interview coordination, and written offer tracking.
          </p>

          <div class="hero-cta-group animate-in-3">
            @if (isAuthenticated()) {
              <a routerLink="/dashboard" class="btn btn-primary btn-lg">Open Your Workspace →</a>
            } @else {
              <a routerLink="/register" class="btn btn-primary btn-lg">Start Tracking Free</a>
              <a routerLink="/login" class="btn btn-secondary btn-lg">Sign in</a>
            }
          </div>

          <div class="hero-trust animate-in-4">
            <span class="trust-item">Full-Stack .NET 10 & Angular</span>
            <span class="bullet">·</span>
            <span class="trust-item">Conflict Prevention Engine</span>
            <span class="bullet">·</span>
            <span class="trust-item">Zero Tracking Pixels</span>
          </div>
        </div>

        <!-- Interactive Live Pipeline Motion Sandbox Canvas -->
        <div class="hero-interactive-canvas animate-in-3" id="pipeline">
          <div class="canvas-window">
            <!-- Window Header Bar -->
            <div class="canvas-header">
              <div class="canvas-left">
                <div class="canvas-dots" aria-hidden="true">
                  <span class="dot dot-red"></span>
                  <span class="dot dot-yellow"></span>
                  <span class="dot dot-green"></span>
                </div>
                <div class="canvas-ticker">
                  <span class="ticker-pulse"></span>
                  <span class="ticker-text">{{ currentTickerMessage() }}</span>
                </div>
              </div>

              <!-- Interactive Filter Tabs -->
              <div class="canvas-filter-tabs">
                <button
                  type="button"
                  class="tab-btn"
                  [class.active]="selectedTab() === 'all'"
                  (click)="selectedTab.set('all')"
                >All ({{ demoCards().length }})</button>
                <button
                  type="button"
                  class="tab-btn"
                  [class.active]="selectedTab() === 'Applied'"
                  (click)="selectedTab.set('Applied')"
                >Applied ({{ appliedCount() }})</button>
                <button
                  type="button"
                  class="tab-btn"
                  [class.active]="selectedTab() === 'Interview'"
                  (click)="selectedTab.set('Interview')"
                >Interviews ({{ interviewCount() }})</button>
                <button
                  type="button"
                  class="tab-btn"
                  [class.active]="selectedTab() === 'Offer'"
                  (click)="selectedTab.set('Offer')"
                >Offers ({{ offerCount() }})</button>
              </div>

              <!-- Quick Sandbox Actions -->
              <div class="canvas-actions">
                <button
                  type="button"
                  class="action-btn"
                  (click)="addDemoCard()"
                  title="Simulate submitting a new application"
                >
                  <span class="plus-icon">+</span> Add Card
                </button>
                <button
                  type="button"
                  class="action-btn-ghost"
                  (click)="resetDemoCards()"
                  title="Reset demo data"
                >
                  ↺ Reset
                </button>
              </div>
            </div>

            <!-- Pipeline Cards Stream -->
            <div class="canvas-body">
              @for (card of filteredCards(); track card.id) {
                <div
                  class="pipeline-card"
                  [class.new-card-enter]="card.isNew"
                  [class]="'stage-' + card.status.toLowerCase()"
                >
                  <div class="card-left">
                    <div class="company-row">
                      <span class="company-name">{{ card.company }}</span>
                      <span class="role-name">{{ card.role }}</span>
                    </div>
                    <div class="card-meta">
                      <span class="card-date">{{ card.date }}</span>
                      <span class="meta-bullet">·</span>
                      <span class="card-salary num">{{ card.salary }}</span>
                      <span class="meta-bullet">·</span>
                      <span class="card-next">{{ card.nextStep }}</span>
                    </div>
                  </div>

                  <div class="card-right">
                    <!-- Interactive Stage Advancer Pill -->
                    <button
                      type="button"
                      class="stage-pill"
                      [class]="'pill-' + card.status.toLowerCase()"
                      (click)="cycleStatus(card)"
                      title="Click to cycle stage: Applied → Interview → Offer"
                    >
                      <span class="pill-dot"></span>
                      <span class="pill-label">{{ card.status }}</span>
                      <span class="cycle-hint">↻</span>
                    </button>
                  </div>
                </div>
              }

              @if (filteredCards().length === 0) {
                <div class="canvas-empty">
                  <span>No applications in {{ selectedTab() }} stage.</span>
                  <button type="button" class="btn btn-secondary btn-sm" (click)="selectedTab.set('all')">View all cards</button>
                </div>
              }
            </div>

            <!-- Interactive Canvas Footer with Real-time Counters -->
            <div class="canvas-footer">
              <div class="canvas-hint">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 16v-4"></path>
                  <path d="M12 8h.01"></path>
                </svg>
                <span>Click any stage badge above to simulate real-time advancement</span>
              </div>
              <div class="canvas-stat">
                <span class="stat-highlight num">{{ offerCount() }} of {{ demoCards().length }}</span>
                <span>converted to written offer ({{ offerRate() }}%)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Architecture Pillars Section -->
      <section class="pillars-section" id="features">
        <div class="section-container">
          <div class="section-intro">
            <h2 class="section-title">Designed for focus and momentum</h2>
            <p class="section-subtitle">A high-velocity workflow engineered to keep your job search structured and confident.</p>
          </div>

          <div class="pillars-grid">
            <div class="pillar-card">
              <div class="pillar-top">
                <h3 class="pillar-heading">Unified Pipeline Triage</h3>
                <p class="pillar-body">
                  Manage every opportunity across 6 standard recruitment stages: Applied, Assessment,
                  Interview, Offer, Rejected, and Withdrawn. Instant search by role, company, or date.
                </p>
              </div>
              <div class="pillar-micro-preview">
                <span class="micro-badge applied">Applied</span>
                <span class="micro-arrow">→</span>
                <span class="micro-badge interview">Interview</span>
                <span class="micro-arrow">→</span>
                <span class="micro-badge offer">Offer</span>
              </div>
            </div>

            <div class="pillar-card">
              <div class="pillar-top">
                <h3 class="pillar-heading">Conflict-Free Interview Hub</h3>
                <p class="pillar-body">
                  The automated 45-minute overlap detection engine shields you from double bookings.
                  Store direct links to Google Meet, Zoom, and Teams with single-click launchers.
                </p>
              </div>
              <div class="pillar-micro-preview">
                <div class="micro-schedule-pill">
                  <span class="dot-green"></span>
                  <span>Overlap Check: Conflict Free</span>
                </div>
              </div>
            </div>

            <div class="pillar-card">
              <div class="pillar-top">
                <h3 class="pillar-heading">Search Velocity & Funnels</h3>
                <p class="pillar-body">
                  Identify where your resume converts and where technical rounds stall.
                  Real-time conversion funnels, response rate analytics, and pacing with zero telemetry.
                </p>
              </div>
              <div class="pillar-micro-preview">
                <div class="micro-stat-pill num">
                  <span>{{ offerRate() }}% Offer Conversion</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Live Interactive Funnel Section (Dynamically Bound to Sandbox) -->
      <section class="funnel-showcase-section" id="funnel">
        <div class="section-container">
          <div class="funnel-box">
            <div class="funnel-info">
              <h2 class="section-title">Your complete search funnel at a glance</h2>
              <p class="section-subtitle">
                Clear conversion rates from initial application through technical rounds to written offer packages.
                These bars animate live as you cycle stages in the sandbox above.
              </p>

              <div class="funnel-metrics-list">
                <div class="metric-row">
                  <span class="metric-label">Applications Submitted</span>
                  <span class="metric-val num">{{ demoCards().length }}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Interviews Reached</span>
                  <span class="metric-val num">{{ interviewReachedCount() }} ({{ interviewRate() }}%)</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Written Offers Secured</span>
                  <span class="metric-val num highlight-offer">{{ offerCount() }} ({{ offerRate() }}%)</span>
                </div>
              </div>
            </div>

            <div class="funnel-visual">
              <div class="funnel-stage">
                <div class="stage-info">
                  <span class="stage-name">Applied</span>
                  <span class="stage-count num">{{ demoCards().length }} Applications (100%)</span>
                </div>
                <div class="funnel-track">
                  <div class="funnel-bar bar-applied" style="width: 100%;"></div>
                </div>
              </div>

              <div class="funnel-stage">
                <div class="stage-info">
                  <span class="stage-name">Interviews</span>
                  <span class="stage-count num">{{ interviewReachedCount() }} ({{ interviewRate() }}%)</span>
                </div>
                <div class="funnel-track">
                  <div class="funnel-bar bar-interview" [style.width.%]="interviewRate()"></div>
                </div>
              </div>

              <div class="funnel-stage">
                <div class="stage-info">
                  <span class="stage-name">Offers</span>
                  <span class="stage-count num">{{ offerCount() }} ({{ offerRate() }}%)</span>
                </div>
                <div class="funnel-track">
                  <div class="funnel-bar bar-offer" [style.width.%]="offerRate()"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Workflow Comparison Section -->
      <section class="comparison-section" id="comparison">
        <div class="section-container">
          <div class="section-intro">
            <h2 class="section-title">Leave fragile spreadsheets behind</h2>
            <p class="section-subtitle">A purpose-built workspace replaces messy columns with actionable clarity.</p>
          </div>

          <div class="comparison-grid">
            <div class="comparison-card card-old">
              <div class="comparison-header">
                <span class="icon-bubble minus">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </span>
                <h3 class="comparison-heading">Generic Spreadsheets</h3>
              </div>
              <ul class="comparison-list">
                <li>Manual copy-pasting of job links and salaries</li>
                <li>Zero detection when interview schedules overlap</li>
                <li>Formulas break when moving rows between sheets</li>
                <li>Difficult to view or update on mobile devices</li>
                <li>No direct launch buttons for Zoom/Meet video calls</li>
              </ul>
            </div>

            <div class="comparison-card card-new">
              <div class="comparison-header">
                <span class="icon-bubble check">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </span>
                <h3 class="comparison-heading">CareerFlow Workspace</h3>
              </div>
              <ul class="comparison-list">
                <li>Structured 6-stage lifecycle with status history</li>
                <li>Automated 45-minute interview clash detection engine</li>
                <li>Real-time conversion funnels & velocity pacing</li>
                <li>Responsive mobile drawer & compact card layouts</li>
                <li>One-click meeting launchers from dashboard & calendar</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- Bottom Call To Action Banner -->
      <section class="bottom-cta-section">
        <div class="section-container">
          <div class="cta-banner">
            <h2 class="cta-title">Ready to take command of your job search?</h2>
            <p class="cta-sub">Join software engineers tracking applications, scheduling rounds, and closing offers with ease.</p>
            <div class="cta-buttons">
              @if (isAuthenticated()) {
                <a routerLink="/dashboard" class="btn btn-primary btn-lg">Open Dashboard →</a>
              } @else {
                <a routerLink="/register" class="btn btn-primary btn-lg">Create Free Account</a>
                <a routerLink="/login" class="btn btn-secondary btn-lg">Sign in</a>
              }
            </div>
          </div>
        </div>
      </section>

      <!-- Public Footer -->
      <footer class="landing-footer">
        <div class="footer-container">
          <div class="footer-left">
            <span class="footer-mark">C</span>
            <span class="footer-brand">CareerFlow</span>
            <span class="footer-tagline">Open source job search tracking system.</span>
          </div>
          <div class="footer-right">
            <span>ASP.NET Core 10 Web API</span>
            <span class="bullet">·</span>
            <span>Angular 19 Standalone</span>
            <span class="bullet">·</span>
            <span>SQL Server 2022</span>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .landing-page {
      min-height: 100dvh;
      background-color: var(--ground);
      color: var(--text);
      position: relative;
      overflow-x: hidden;
    }

    /* Floating Frosted Header */
    .landing-header {
      position: sticky;
      top: 0;
      z-index: 100;
      background-color: var(--surface);
      height: 56px;
      display: flex;
      align-items: center;
    }

    .header-container {
      width: 100%;
      max-width: 1180px;
      margin: 0 auto;
      padding: 0 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .brand-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: var(--text);
    }

    .logo-mark {
      width: 26px;
      height: 26px;
      background-color: var(--primary);
      color: var(--primary-ink);
      border-radius: var(--radius-control);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 13.5px;
      line-height: 1;
    }

    .brand-name {
      font-size: 16px;
      font-weight: 600;
      letter-spacing: -0.015em;
      color: var(--text);
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .nav-link {
      font-size: 14px;
      color: var(--muted);
      text-decoration: none;
      transition: color var(--transition-fast);
    }

    .nav-link:hover {
      color: var(--text);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .btn-theme {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: var(--radius-control);
      border: 1px solid var(--border);
      background-color: var(--surface);
      color: var(--muted);
      cursor: pointer;
      transition: background-color var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
    }

    .btn-theme:hover {
      background-color: var(--raised);
      color: var(--text);
      border-color: var(--control);
    }

    .theme-icon {
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .btn-theme:hover .theme-icon {
      transform: rotate(15deg);
    }

    .btn-lg {
      padding: 12px 24px;
      font-size: 16px;
      border-radius: var(--radius-control);
      font-weight: 500;
    }

    /* Hero Section */
    .hero-section {
      max-width: 1180px;
      margin: 0 auto;
      padding: 64px 24px 72px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .hero-content {
      max-width: 860px;
      margin-bottom: 44px;
    }

    /* Dominant Display Headline */
    .hero-headline {
      font-size: clamp(44px, 6.2vw, 76px);
      font-weight: 800;
      line-height: 1.05;
      letter-spacing: -0.035em;
      color: var(--text);
      margin-bottom: 22px;
    }

    .headline-accent {
      color: var(--accent);
    }

    .hero-subline {
      font-size: 16px;
      line-height: 1.6;
      color: var(--muted);
      margin-bottom: 32px;
      max-width: 660px;
      margin-left: auto;
      margin-right: auto;
    }

    .hero-cta-group {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 24px;
    }

    .hero-trust {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 13.5px;
      color: var(--muted);
    }

    .trust-item {
      color: var(--muted);
    }

    .bullet {
      color: var(--border);
    }

    /* Motion Entrance Choreography */
    .animate-in-1 { animation: rise 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }
    .animate-in-2 { animation: rise 0.48s 0.08s cubic-bezier(0.16, 1, 0.3, 1) both; }
    .animate-in-3 { animation: rise 0.54s 0.16s cubic-bezier(0.16, 1, 0.3, 1) both; }
    .animate-in-4 { animation: rise 0.6s 0.24s cubic-bezier(0.16, 1, 0.3, 1) both; }

    @keyframes rise {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (prefers-reduced-motion: reduce) {
      .animate-in-1, .animate-in-2, .animate-in-3, .animate-in-4,
      .ticker-pulse, .pipeline-card {
        animation: none !important;
      }
    }

    /* Interactive Pipeline Motion Sandbox Canvas */
    .hero-interactive-canvas {
      width: 100%;
      max-width: 920px;
    }

    .canvas-window {
      background-color: var(--surface);
      border-radius: var(--radius-card);
      overflow: hidden;
      text-align: left;
    }

    .canvas-header {
      padding: 12px 18px;
      background-color: var(--raised);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
    }

    .canvas-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .canvas-dots {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .canvas-dots .dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background-color: var(--border);
    }

    .dot-red { background-color: #ef4444 !important; }
    .dot-yellow { background-color: #f59e0b !important; }
    .dot-green { background-color: #10b981 !important; }

    .canvas-ticker {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13.5px;
      color: var(--text);
    }

    .ticker-pulse {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: var(--positive);
      animation: pulse-ring 2s infinite ease-out;
    }

    @keyframes pulse-ring {
      0% { transform: scale(0.9); opacity: 0.9; }
      70%, 100% { transform: scale(2.2); opacity: 0; }
    }

    .ticker-text {
      font-weight: 500;
      color: var(--text);
      transition: opacity 0.3s ease;
    }

    .canvas-filter-tabs {
      display: flex;
      align-items: center;
      gap: 4px;
      background-color: var(--ground);
      padding: 2px;
      border-radius: var(--radius-chip);
    }

    .tab-btn {
      padding: 4px 10px;
      font-size: 13px;
      border-radius: var(--radius-chip);
      color: var(--muted);
      cursor: pointer;
      border: none;
      background: transparent;
      transition: all var(--transition-fast);
    }

    .tab-btn.active {
      background-color: var(--surface);
      color: var(--text);
      font-weight: 500;
    }

    .canvas-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .action-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      font-size: 13px;
      font-weight: 500;
      border-radius: var(--radius-chip);
      background-color: var(--surface);
      border: 1px solid var(--border);
      color: var(--text);
      cursor: pointer;
      transition: background-color var(--transition-fast);
    }

    .action-btn:hover {
      background-color: var(--raised);
    }

    .action-btn-ghost {
      padding: 4px 8px;
      font-size: 13px;
      border-radius: var(--radius-chip);
      background: transparent;
      border: none;
      color: var(--muted);
      cursor: pointer;
      transition: color var(--transition-fast);
    }

    .action-btn-ghost:hover {
      color: var(--text);
    }

    .canvas-body {
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      min-height: 240px;
      background-color: var(--surface);
    }

    /* Pipeline Card - Pure Tone Surface */
    .pipeline-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 18px;
      border-radius: var(--radius-control);
      background-color: var(--ground);
      transition: background-color var(--transition-fast), transform var(--transition-fast);
    }

    .pipeline-card:hover {
      background-color: var(--raised);
      transform: translateY(-1px);
    }

    .new-card-enter {
      animation: slide-in-down 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    @keyframes slide-in-down {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .company-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }

    .company-name {
      font-size: 15px;
      font-weight: 600;
      color: var(--text);
    }

    .role-name {
      font-size: 14px;
      color: var(--muted);
    }

    .card-meta {
      font-size: 13px;
      color: var(--muted);
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }

    .meta-bullet {
      color: var(--border);
    }

    /* Interactive Stage Advancer Pill */
    .stage-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 500;
      padding: 4px 12px;
      border-radius: var(--radius-chip);
      border: none;
      cursor: pointer;
      user-select: none;
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .stage-pill:hover {
      transform: scale(1.05);
    }

    .stage-pill:active {
      transform: scale(0.96);
    }

    .pill-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: currentColor;
    }

    .cycle-hint {
      font-size: 12px;
      opacity: 0.7;
    }

    .pill-applied {
      background-color: var(--pill-applied-bg);
      color: var(--pill-applied-ink);
    }

    .pill-interview {
      background-color: var(--pill-interview-bg);
      color: var(--pill-interview-ink);
    }

    .pill-offer {
      background-color: var(--pill-positive-bg);
      color: var(--pill-positive-ink);
    }

    .canvas-empty {
      padding: 36px 16px;
      text-align: center;
      color: var(--muted);
      font-size: 14px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .canvas-footer {
      padding: 12px 18px;
      background-color: var(--raised);
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 13px;
      color: var(--text);
      flex-wrap: wrap;
      gap: 8px;
    }

    .canvas-hint {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--muted);
    }

    .canvas-stat {
      display: flex;
      align-items: center;
      gap: 4px;
      color: var(--text);
    }

    .stat-highlight {
      font-weight: 600;
      color: var(--text);
    }

    /* Pillars Section */
    .pillars-section {
      padding: 72px 24px;
      background-color: var(--surface);
    }

    .section-container {
      max-width: 1180px;
      margin: 0 auto;
    }

    .section-intro {
      text-align: center;
      margin-bottom: 48px;
    }

    .section-title {
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--text);
      margin-bottom: 10px;
    }

    .section-subtitle {
      font-size: 16px;
      color: var(--muted);
      max-width: 600px;
      margin: 0 auto;
    }

    .pillars-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }

    .pillar-card {
      padding: 26px;
      border-radius: var(--radius-card);
      background-color: var(--raised);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: transform var(--transition-fast);
    }

    .pillar-card:hover {
      transform: translateY(-2px);
    }

    .pillar-heading {
      font-size: 18px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 8px;
    }

    .pillar-body {
      font-size: 15px;
      line-height: 1.6;
      color: var(--muted);
      margin-bottom: 20px;
    }

    .pillar-micro-preview {
      display: flex;
      align-items: center;
      gap: 6px;
      padding-top: 14px;
    }

    .micro-badge {
      font-size: 13px;
      font-weight: 500;
      padding: 2px 8px;
      border-radius: var(--radius-chip);
    }

    .micro-badge.applied { background-color: var(--pill-applied-bg); color: var(--pill-applied-ink); }
    .micro-badge.interview { background-color: var(--pill-interview-bg); color: var(--pill-interview-ink); }
    .micro-badge.offer { background-color: var(--pill-positive-bg); color: var(--pill-positive-ink); }

    .micro-arrow {
      font-size: 13px;
      color: var(--muted);
    }

    .micro-schedule-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: var(--positive);
      font-weight: 500;
    }

    .micro-stat-pill {
      font-size: 13.5px;
      color: var(--text);
      font-weight: 600;
    }

    /* Live Interactive Funnel Section */
    .funnel-showcase-section {
      padding: 72px 24px;
      background-color: var(--ground);
    }

    .funnel-box {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 48px;
      align-items: center;
      padding: 36px;
      border-radius: var(--radius-card);
      background-color: var(--surface);
    }

    .funnel-info .section-title {
      text-align: left;
    }

    .funnel-info .section-subtitle {
      margin: 0;
      text-align: left;
    }

    .funnel-metrics-list {
      margin-top: 24px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .metric-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      border-radius: var(--radius-control);
      background-color: var(--raised);
      font-size: 14px;
    }

    .metric-label {
      color: var(--muted);
    }

    .metric-val {
      font-weight: 600;
      color: var(--text);
    }

    .highlight-offer {
      color: var(--positive);
    }

    .funnel-visual {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .funnel-stage {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .stage-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 13.5px;
    }

    .stage-name {
      font-weight: 500;
      color: var(--text);
    }

    .stage-count {
      color: var(--muted);
    }

    .funnel-track {
      height: 18px;
      background-color: var(--raised);
      border-radius: var(--radius-chip);
      overflow: hidden;
    }

    .funnel-bar {
      height: 100%;
      border-radius: var(--radius-chip);
      transition: width 0.7s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .bar-applied { background-color: var(--accent); }
    .bar-interview { background-color: #3b82f6; }
    .bar-offer { background-color: var(--positive); }

    /* Comparison Section */
    .comparison-section {
      padding: 72px 24px;
      background-color: var(--surface);
    }

    .comparison-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      max-width: 900px;
      margin: 0 auto;
    }

    .comparison-card {
      padding: 28px;
      border-radius: var(--radius-card);
      background-color: var(--ground);
    }

    .card-new {
      background-color: var(--raised);
    }

    .comparison-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
    }

    .icon-bubble {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 26px;
      height: 26px;
      border-radius: 50%;
    }

    .icon-bubble.minus {
      background-color: var(--pill-negative-bg);
      color: var(--negative);
    }

    .icon-bubble.check {
      background-color: var(--pill-positive-bg);
      color: var(--positive);
    }

    .comparison-heading {
      font-size: 18px;
      font-weight: 600;
      color: var(--text);
      margin: 0;
    }

    .comparison-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .comparison-list li {
      font-size: 15px;
      line-height: 1.5;
      color: var(--muted);
      position: relative;
      padding-left: 18px;
    }

    .card-old .comparison-list li::before {
      content: '—';
      position: absolute;
      left: 0;
      color: var(--muted);
    }

    .card-new .comparison-list li::before {
      content: '•';
      position: absolute;
      left: 0;
      color: var(--positive);
      font-weight: bold;
    }

    /* Bottom CTA Banner */
    .bottom-cta-section {
      padding: 64px 24px;
      background-color: var(--ground);
    }

    .cta-banner {
      max-width: 680px;
      margin: 0 auto;
      text-align: center;
    }

    .cta-title {
      font-size: 30px;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--text);
      margin-bottom: 10px;
    }

    .cta-sub {
      font-size: 16px;
      color: var(--muted);
      margin-bottom: 24px;
    }

    .cta-buttons {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }

    /* Footer */
    .landing-footer {
      padding: 24px;
      background-color: var(--surface);
    }

    .footer-container {
      max-width: 1180px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 13.5px;
      color: var(--muted);
    }

    .footer-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .footer-mark {
      font-weight: 700;
      font-size: 12px;
      padding: 2px 6px;
      border-radius: var(--radius-sm);
      background-color: var(--raised);
      color: var(--text);
    }

    .footer-brand {
      font-weight: 600;
      color: var(--text);
    }

    .footer-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Responsive Design */
    @media (max-width: 900px) {
      .hero-headline {
        font-size: 38px;
      }
      .pillars-grid {
        grid-template-columns: 1fr;
      }
      .funnel-box {
        grid-template-columns: 1fr;
        gap: 28px;
        padding: 24px;
      }
      .comparison-grid {
        grid-template-columns: 1fr;
      }
      .nav-links {
        display: none;
      }
      .footer-container {
        flex-direction: column;
        gap: 12px;
        text-align: center;
      }
    }

    @media (max-width: 600px) {
      .hero-section {
        padding: 40px 16px 48px;
      }
      .hero-headline {
        font-size: 28px;
        line-height: 1.15;
      }
      .hero-cta-group {
        flex-direction: column;
        width: 100%;
      }
      .hero-cta-group .btn {
        width: 100%;
      }
      .canvas-header {
        flex-direction: column;
        align-items: flex-start;
      }
      .canvas-filter-tabs {
        width: 100%;
        overflow-x: auto;
      }
      .pipeline-card {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
      }
      .card-right {
        align-self: flex-end;
      }
    }
  `]
})
export class LandingPageComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);

  isAuthenticated = computed(() => !!this.authService.currentUser());
  isDark = signal(
    this.authService.currentUser()?.theme === 'dark' ||
    document.documentElement.getAttribute('data-theme') === 'dark'
  );

  selectedTab = signal<'all' | 'Applied' | 'Interview' | 'Offer'>('all');

  tickerIndex = signal(0);
  tickerMessages = [
    'Stripe · Technical interview loop scheduled',
    'Netflix · Written offer package delivered ($240k)',
    'AWS · System design screening confirmed',
    'Datadog · Application submitted and verified'
  ];

  currentTickerMessage = computed(() => this.tickerMessages[this.tickerIndex()]);

  private tickerTimer: any;

  demoCards = signal<DemoCard[]>([
    {
      id: '1',
      company: 'Stripe',
      role: 'Senior Backend Engineer',
      status: 'Interview',
      date: 'Applied Oct 15',
      salary: '$185k - $210k',
      nextStep: 'System design scheduled'
    },
    {
      id: '2',
      company: 'Netflix',
      role: 'Staff Systems Engineer',
      status: 'Offer',
      date: 'Applied Sep 24',
      salary: '$240k total comp',
      nextStep: 'Offer package review'
    },
    {
      id: '3',
      company: 'AWS',
      role: 'SDE II (Cloud Infrastructure)',
      status: 'Interview',
      date: 'Applied Oct 11',
      salary: '$170k - $195k',
      nextStep: 'Technical loop upcoming'
    },
    {
      id: '4',
      company: 'Datadog',
      role: 'Distributed Systems Engineer',
      status: 'Applied',
      date: 'Applied Oct 27',
      salary: '$180k - $205k',
      nextStep: 'Recruiter resume review'
    }
  ]);

  filteredCards = computed(() => {
    const tab = this.selectedTab();
    const cards = this.demoCards();
    if (tab === 'all') return cards;
    return cards.filter(c => c.status === tab);
  });

  appliedCount = computed(() => this.demoCards().filter(c => c.status === 'Applied').length);
  interviewCount = computed(() => this.demoCards().filter(c => c.status === 'Interview').length);
  offerCount = computed(() => this.demoCards().filter(c => c.status === 'Offer').length);

  interviewReachedCount = computed(() => this.interviewCount() + this.offerCount());

  interviewRate = computed(() => {
    const total = this.demoCards().length;
    if (total === 0) return 0;
    return Math.round((this.interviewReachedCount() / total) * 100);
  });

  offerRate = computed(() => {
    const total = this.demoCards().length;
    if (total === 0) return 0;
    return Math.round((this.offerCount() / total) * 100);
  });

  ngOnInit() {
    this.tickerTimer = setInterval(() => {
      this.tickerIndex.update(i => (i + 1) % this.tickerMessages.length);
    }, 3800);
  }

  ngOnDestroy() {
    if (this.tickerTimer) {
      clearInterval(this.tickerTimer);
    }
  }

  cycleStatus(card: DemoCard) {
    this.demoCards.update(cards => {
      return cards.map(c => {
        if (c.id !== card.id) return c;
        let nextStatus: DemoCard['status'];
        let nextStep = c.nextStep;
        if (c.status === 'Applied') {
          nextStatus = 'Interview';
          nextStep = 'Technical screening scheduled';
        } else if (c.status === 'Interview') {
          nextStatus = 'Offer';
          nextStep = 'Offer negotiation in progress';
        } else {
          nextStatus = 'Applied';
          nextStep = 'Resume submitted';
        }
        return { ...c, status: nextStatus, nextStep, isNew: false };
      });
    });
  }

  addDemoCard() {
    const companies = [
      { company: 'Linear', role: 'Frontend Architect', salary: '$190k - $220k', nextStep: 'Initial screening' },
      { company: 'Cloudflare', role: 'Edge Runtime Engineer', salary: '$185k - $215k', nextStep: 'Resume reviewed' },
      { company: 'Figma', role: 'Staff Systems Engineer', salary: '$225k - $250k', nextStep: 'Recruiter call' }
    ];
    const pick = companies[Math.floor(Math.random() * companies.length)];
    const newCard: DemoCard = {
      id: Date.now().toString(),
      company: pick.company,
      role: pick.role,
      status: 'Applied',
      date: 'Applied today',
      salary: pick.salary,
      nextStep: pick.nextStep,
      isNew: true
    };
    this.demoCards.update(cards => [newCard, ...cards]);
  }

  resetDemoCards() {
    this.demoCards.set([
      {
        id: '1',
        company: 'Stripe',
        role: 'Senior Backend Engineer',
        status: 'Interview',
        date: 'Applied Oct 15',
        salary: '$185k - $210k',
        nextStep: 'System design scheduled'
      },
      {
        id: '2',
        company: 'Netflix',
        role: 'Staff Systems Engineer',
        status: 'Offer',
        date: 'Applied Sep 24',
        salary: '$240k total comp',
        nextStep: 'Offer package review'
      },
      {
        id: '3',
        company: 'AWS',
        role: 'SDE II (Cloud Infrastructure)',
        status: 'Interview',
        date: 'Applied Oct 11',
        salary: '$170k - $195k',
        nextStep: 'Technical loop upcoming'
      },
      {
        id: '4',
        company: 'Datadog',
        role: 'Distributed Systems Engineer',
        status: 'Applied',
        date: 'Applied Oct 27',
        salary: '$180k - $205k',
        nextStep: 'Recruiter resume review'
      }
    ]);
    this.selectedTab.set('all');
  }

  toggleTheme() {
    const nextDark = !this.isDark();
    this.isDark.set(nextDark);
    const theme = nextDark ? 'dark' : 'light';
    this.authService.applyTheme(theme);
  }
}

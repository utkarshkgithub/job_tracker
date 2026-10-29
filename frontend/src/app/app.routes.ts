import { Routes } from '@angular/router';
import { authGuard, publicGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './shared/components/layout/layout.component';

export const routes: Routes = [
  // Public Landing Page
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingPageComponent)
  },

  // Public Authentication Routes
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [publicGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
    canActivate: [publicGuard]
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
    canActivate: [publicGuard]
  },

  // Authenticated Application Routes (Shell with persistent Sidebar & Header)
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'applications',
        loadComponent: () => import('./features/applications/application-list/application-list.component').then(m => m.ApplicationListComponent)
      },
      {
        path: 'applications/new',
        loadComponent: () => import('./features/applications/application-form/application-form.component').then(m => m.ApplicationFormComponent)
      },
      {
        path: 'applications/:id',
        loadComponent: () => import('./features/applications/application-detail/application-detail.component').then(m => m.ApplicationDetailComponent)
      },
      {
        path: 'applications/:id/edit',
        loadComponent: () => import('./features/applications/application-form/application-form.component').then(m => m.ApplicationFormComponent)
      },
      {
        path: 'interviews',
        loadComponent: () => import('./features/interviews/interview-list/interview-list.component').then(m => m.InterviewListComponent)
      },
      {
        path: 'analytics',
        loadComponent: () => import('./features/analytics/analytics.component').then(m => m.AnalyticsComponent)
      },
      {
        path: 'settings/profile',
        loadComponent: () => import('./features/settings/profile/profile.component').then(m => m.ProfileSettingsComponent)
      },
      {
        path: 'settings/preferences',
        loadComponent: () => import('./features/settings/preferences/preferences.component').then(m => m.PreferencesComponent)
      }
    ]
  },

  // Wildcard fallback
  {
    path: '**',
    redirectTo: ''
  }
];

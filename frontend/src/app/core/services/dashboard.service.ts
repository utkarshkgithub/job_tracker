import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AnalyticsData, DashboardData } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);

  getDashboard(): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${environment.apiUrl}/dashboard`);
  }

  getAnalytics(period: string = '30days'): Observable<AnalyticsData> {
    const params = new HttpParams().set('period', period);
    return this.http.get<AnalyticsData>(`${environment.apiUrl}/analytics`, { params });
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApplicationFilter,
  ApplicationLookup,
  CreateJobApplicationRequest,
  JobApplication,
  PagedResult,
  UpdateJobApplicationRequest
} from '../models/application.model';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/applications`;

  getApplications(filter: ApplicationFilter): Observable<PagedResult<JobApplication>> {
    let params = new HttpParams();

    if (filter.search) params = params.set('search', filter.search);
    if (filter.status !== undefined && filter.status !== null) params = params.set('status', filter.status.toString());
    if (filter.dateFilter) params = params.set('dateFilter', filter.dateFilter);
    if (filter.customStartDate) params = params.set('customStartDate', filter.customStartDate);
    if (filter.customEndDate) params = params.set('customEndDate', filter.customEndDate);
    if (filter.sortBy) params = params.set('sortBy', filter.sortBy);
    if (filter.page) params = params.set('page', filter.page.toString());
    if (filter.pageSize) params = params.set('pageSize', filter.pageSize.toString());

    return this.http.get<PagedResult<JobApplication>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<JobApplication> {
    return this.http.get<JobApplication>(`${this.baseUrl}/${id}`);
  }

  create(req: CreateJobApplicationRequest): Observable<{ data: JobApplication; message: string; isDuplicateWarning: boolean }> {
    return this.http.post<{ data: JobApplication; message: string; isDuplicateWarning: boolean }>(this.baseUrl, req);
  }

  update(id: number, req: UpdateJobApplicationRequest): Observable<{ data: JobApplication; message: string }> {
    return this.http.put<{ data: JobApplication; message: string }>(`${this.baseUrl}/${id}`, req);
  }

  updateStatus(id: number, status: number): Observable<{ data: JobApplication; message: string }> {
    return this.http.patch<{ data: JobApplication; message: string }>(`${this.baseUrl}/${id}/status`, { status });
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }

  getLookup(): Observable<ApplicationLookup[]> {
    return this.http.get<ApplicationLookup[]>(`${this.baseUrl}/lookup`);
  }
}

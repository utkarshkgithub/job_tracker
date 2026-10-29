import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateInterviewRequest, Interview, UpdateInterviewRequest } from '../models/interview.model';

@Injectable({
  providedIn: 'root'
})
export class InterviewService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/interviews`;

  getInterviews(filter: 'upcoming' | 'past' | 'all' = 'upcoming'): Observable<Interview[]> {
    const params = new HttpParams().set('filter', filter);
    return this.http.get<Interview[]>(this.baseUrl, { params });
  }

  getCalendarInterviews(startDate: string, endDate: string): Observable<Interview[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<Interview[]>(`${this.baseUrl}/calendar`, { params });
  }

  getByApplicationId(applicationId: number): Observable<Interview[]> {
    return this.http.get<Interview[]>(`${this.baseUrl}/by-application/${applicationId}`);
  }

  getById(id: number): Observable<Interview> {
    return this.http.get<Interview>(`${this.baseUrl}/${id}`);
  }

  create(req: CreateInterviewRequest): Observable<{ data: Interview; message: string; hasOverlapWarning: boolean }> {
    return this.http.post<{ data: Interview; message: string; hasOverlapWarning: boolean }>(this.baseUrl, req);
  }

  update(id: number, req: UpdateInterviewRequest): Observable<{ data: Interview; message: string }> {
    return this.http.put<{ data: Interview; message: string }>(`${this.baseUrl}/${id}`, req);
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }
}

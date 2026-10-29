export type ApplicationStatus = 'Applied' | 'Assessment' | 'Interview' | 'Offer' | 'Rejected' | 'Withdrawn';

export interface JobApplication {
  id: number;
  companyName: string;
  jobTitle: string;
  jobPostingUrl?: string;
  applicationDate: string;
  status: number | ApplicationStatus;
  statusName: ApplicationStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  interviewCount: number;
  nextInterviewDate?: string;
  nextInterviewRound?: string;
}

export interface CreateJobApplicationRequest {
  companyName: string;
  jobTitle: string;
  jobPostingUrl?: string;
  applicationDate: string;
  status: number;
  notes?: string;
}

export interface UpdateJobApplicationRequest {
  companyName: string;
  jobTitle: string;
  jobPostingUrl?: string;
  applicationDate: string;
  status: number;
  notes?: string;
}

export interface ApplicationFilter {
  search?: string;
  status?: number;
  dateFilter?: string;
  customStartDate?: string;
  customEndDate?: string;
  sortBy?: string;
  page?: number;
  pageSize?: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface ApplicationLookup {
  id: number;
  companyName: string;
  jobTitle: string;
  displayText: string;
}

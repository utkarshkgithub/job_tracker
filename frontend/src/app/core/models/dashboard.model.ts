import { JobApplication } from './application.model';
import { Interview } from './interview.model';

export interface DashboardSummary {
  totalApplications: number;
  activeApplications: number;
  upcomingInterviewsCount: number;
  offersCount: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  statusDistribution: StatusDistribution[];
  upcomingInterviews: Interview[];
  recentApplications: JobApplication[];
}

export interface TrendPoint {
  dateLabel: string;
  count: number;
}

export interface ConversionFunnel {
  applicationsCount: number;
  interviewsStageCount: number;
  offersCount: number;
  applicationToInterviewRate: number;
  interviewToOfferRate: number;
  overallConversionRate: number;
}

export interface AnalyticsData {
  period: string;
  totalApplicationsInPeriod: number;
  scheduledInterviewsInPeriod: number;
  offersReceivedInPeriod: number;
  applicationTrends: TrendPoint[];
  statusDistribution: StatusDistribution[];
  conversionFunnel: ConversionFunnel;
}

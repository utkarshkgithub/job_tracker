namespace CareerFlow.Api.DTOs;

public class DashboardSummaryDto
{
    public int TotalApplications { get; set; }
    public int ActiveApplications { get; set; } // Applied, Assessment, Interview
    public int UpcomingInterviewsCount { get; set; }
    public int OffersCount { get; set; }
}

public class StatusDistributionDto
{
    public string Status { get; set; } = string.Empty;
    public int Count { get; set; }
    public double Percentage { get; set; }
}

public class DashboardDto
{
    public DashboardSummaryDto Summary { get; set; } = new();
    public List<StatusDistributionDto> StatusDistribution { get; set; } = new();
    public List<InterviewDto> UpcomingInterviews { get; set; } = new();
    public List<JobApplicationDto> RecentApplications { get; set; } = new();
}

public class TrendPointDto
{
    public string DateLabel { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class ConversionFunnelDto
{
    public int ApplicationsCount { get; set; }
    public int InterviewsStageCount { get; set; }
    public int OffersCount { get; set; }
    public double ApplicationToInterviewRate { get; set; }
    public double InterviewToOfferRate { get; set; }
    public double OverallConversionRate { get; set; }
}

public class AnalyticsDto
{
    public string Period { get; set; } = "30days"; // 7days, 30days, 90days, year, all
    public int TotalApplicationsInPeriod { get; set; }
    public int ScheduledInterviewsInPeriod { get; set; }
    public int OffersReceivedInPeriod { get; set; }
    public List<TrendPointDto> ApplicationTrends { get; set; } = new();
    public List<StatusDistributionDto> StatusDistribution { get; set; } = new();
    public ConversionFunnelDto ConversionFunnel { get; set; } = new();
}

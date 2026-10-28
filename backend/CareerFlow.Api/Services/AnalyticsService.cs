using CareerFlow.Api.Data;
using CareerFlow.Api.DTOs;
using CareerFlow.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace CareerFlow.Api.Services;

public class AnalyticsService : IAnalyticsService
{
    private readonly CareerFlowDbContext _context;
    private readonly ILogger<AnalyticsService> _logger;

    public AnalyticsService(CareerFlowDbContext context, ILogger<AnalyticsService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<DashboardDto> GetDashboardDataAsync(string userId)
    {
        var now = DateTime.UtcNow;

        var applications = await _context.JobApplications
            .AsNoTracking()
            .Where(a => a.UserId == userId)
            .ToListAsync();

        var totalApps = applications.Count;
        var activeApps = applications.Count(a =>
            a.Status == ApplicationStatus.Applied ||
            a.Status == ApplicationStatus.Assessment ||
            a.Status == ApplicationStatus.Interview);
        var offersCount = applications.Count(a => a.Status == ApplicationStatus.Offer);

        var upcomingInterviews = await _context.Interviews
            .AsNoTracking()
            .Include(i => i.JobApplication)
            .Where(i => i.UserId == userId && i.ScheduledAt >= now)
            .OrderBy(i => i.ScheduledAt)
            .Take(5)
            .Select(i => new InterviewDto
            {
                Id = i.Id,
                JobApplicationId = i.JobApplicationId,
                CompanyName = i.JobApplication != null ? i.JobApplication.CompanyName : string.Empty,
                JobTitle = i.JobApplication != null ? i.JobApplication.JobTitle : string.Empty,
                Round = i.Round,
                Type = i.Type,
                ScheduledAt = i.ScheduledAt,
                MeetingUrl = i.MeetingUrl,
                Notes = i.Notes,
                CreatedAt = i.CreatedAt,
                UpdatedAt = i.UpdatedAt
            })
            .ToListAsync();

        var upcomingInterviewsCount = await _context.Interviews
            .AsNoTracking()
            .CountAsync(i => i.UserId == userId && i.ScheduledAt >= now);

        // Status distribution
        var statuses = Enum.GetValues<ApplicationStatus>();
        var statusDistribution = statuses.Select(s =>
        {
            var count = applications.Count(a => a.Status == s);
            return new StatusDistributionDto
            {
                Status = s.ToString(),
                Count = count,
                Percentage = totalApps > 0 ? Math.Round((double)count / totalApps * 100, 1) : 0
            };
        }).ToList();

        // 5 most recently updated applications
        var recentApplications = await _context.JobApplications
            .AsNoTracking()
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.UpdatedAt)
            .Take(5)
            .Select(a => new JobApplicationDto
            {
                Id = a.Id,
                CompanyName = a.CompanyName,
                JobTitle = a.JobTitle,
                JobPostingUrl = a.JobPostingUrl,
                ApplicationDate = a.ApplicationDate,
                Status = a.Status,
                Notes = a.Notes,
                CreatedAt = a.CreatedAt,
                UpdatedAt = a.UpdatedAt,
                InterviewCount = a.Interviews.Count
            })
            .ToListAsync();

        return new DashboardDto
        {
            Summary = new DashboardSummaryDto
            {
                TotalApplications = totalApps,
                ActiveApplications = activeApps,
                UpcomingInterviewsCount = upcomingInterviewsCount,
                OffersCount = offersCount
            },
            StatusDistribution = statusDistribution,
            UpcomingInterviews = upcomingInterviews,
            RecentApplications = recentApplications
        };
    }

    public async Task<AnalyticsDto> GetAnalyticsDataAsync(string userId, string? period = "30days")
    {
        var now = DateTime.UtcNow;
        DateTime? startDate = period?.ToLower() switch
        {
            "7days" => now.AddDays(-7),
            "90days" => now.AddDays(-90),
            "year" => now.AddDays(-365),
            "all" => null,
            _ => now.AddDays(-30) // default 30 days
        };

        var appQuery = _context.JobApplications
            .AsNoTracking()
            .Where(a => a.UserId == userId);

        if (startDate.HasValue)
        {
            appQuery = appQuery.Where(a => a.ApplicationDate >= startDate.Value);
        }

        var appsInPeriod = await appQuery.ToListAsync();
        var totalApps = appsInPeriod.Count;

        var intQuery = _context.Interviews
            .AsNoTracking()
            .Where(i => i.UserId == userId);

        if (startDate.HasValue)
        {
            intQuery = intQuery.Where(i => i.ScheduledAt >= startDate.Value);
        }

        var scheduledInterviews = await intQuery.CountAsync();
        var offersReceived = appsInPeriod.Count(a => a.Status == ApplicationStatus.Offer);

        // Status distribution in period
        var statuses = Enum.GetValues<ApplicationStatus>();
        var statusDistribution = statuses.Select(s =>
        {
            var count = appsInPeriod.Count(a => a.Status == s);
            return new StatusDistributionDto
            {
                Status = s.ToString(),
                Count = count,
                Percentage = totalApps > 0 ? Math.Round((double)count / totalApps * 100, 1) : 0
            };
        }).ToList();

        // Application trend
        var trends = new List<TrendPointDto>();
        if (period?.ToLower() == "7days")
        {
            for (int i = 6; i >= 0; i--)
            {
                var day = now.AddDays(-i).Date;
                var count = appsInPeriod.Count(a => a.ApplicationDate.Date == day);
                trends.Add(new TrendPointDto { DateLabel = day.ToString("MMM dd"), Count = count });
            }
        }
        else if (period?.ToLower() == "year" || period?.ToLower() == "all")
        {
            for (int i = 11; i >= 0; i--)
            {
                var monthStart = new DateTime(now.Year, now.Month, 1).AddMonths(-i);
                var monthEnd = monthStart.AddMonths(1).AddTicks(-1);
                var count = appsInPeriod.Count(a => a.ApplicationDate >= monthStart && a.ApplicationDate <= monthEnd);
                trends.Add(new TrendPointDto { DateLabel = monthStart.ToString("MMM yyyy"), Count = count });
            }
        }
        else
        {
            // Default 30 days grouped in 5-day intervals or weekly
            for (int i = 5; i >= 0; i--)
            {
                var bucketStart = now.AddDays(-(i + 1) * 5);
                var bucketEnd = now.AddDays(-i * 5);
                var count = appsInPeriod.Count(a => a.ApplicationDate > bucketStart && a.ApplicationDate <= bucketEnd);
                trends.Add(new TrendPointDto { DateLabel = $"{bucketStart:MMM dd} - {bucketEnd:MMM dd}", Count = count });
            }
        }

        // Conversion funnel: Distinct applications that reached interview stage, distinct offers
        var allUserAppIds = appsInPeriod.Select(a => a.Id).ToList();
        var appsWithInterviewsCount = await _context.Interviews
            .AsNoTracking()
            .Where(i => i.UserId == userId && allUserAppIds.Contains(i.JobApplicationId))
            .Select(i => i.JobApplicationId)
            .Distinct()
            .CountAsync();

        // Include any applications in Interview, Offer stage even if interview events not recorded yet
        var reachedInterviewStage = appsInPeriod.Count(a =>
            a.Status == ApplicationStatus.Interview ||
            a.Status == ApplicationStatus.Offer ||
            allUserAppIds.Contains(a.Id) && appsWithInterviewsCount > 0);

        // Normalize so it does not exceed totalApps
        if (reachedInterviewStage > totalApps && totalApps > 0)
        {
            reachedInterviewStage = totalApps;
        }

        var appToInterviewRate = totalApps > 0 ? Math.Round((double)reachedInterviewStage / totalApps * 100, 1) : 0;
        var interviewToOfferRate = reachedInterviewStage > 0 ? Math.Round((double)offersReceived / reachedInterviewStage * 100, 1) : 0;
        var overallConversionRate = totalApps > 0 ? Math.Round((double)offersReceived / totalApps * 100, 1) : 0;

        return new AnalyticsDto
        {
            Period = period ?? "30days",
            TotalApplicationsInPeriod = totalApps,
            ScheduledInterviewsInPeriod = scheduledInterviews,
            OffersReceivedInPeriod = offersReceived,
            ApplicationTrends = trends,
            StatusDistribution = statusDistribution,
            ConversionFunnel = new ConversionFunnelDto
            {
                ApplicationsCount = totalApps,
                InterviewsStageCount = reachedInterviewStage,
                OffersCount = offersReceived,
                ApplicationToInterviewRate = appToInterviewRate,
                InterviewToOfferRate = interviewToOfferRate,
                OverallConversionRate = overallConversionRate
            }
        };
    }
}

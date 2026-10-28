using CareerFlow.Api.DTOs;

namespace CareerFlow.Api.Services;

public interface IAnalyticsService
{
    Task<DashboardDto> GetDashboardDataAsync(string userId);
    Task<AnalyticsDto> GetAnalyticsDataAsync(string userId, string? period = "30days");
}

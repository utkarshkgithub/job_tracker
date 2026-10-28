using CareerFlow.Api.DTOs;

namespace CareerFlow.Api.Services;

public interface IInterviewService
{
    Task<List<InterviewDto>> GetInterviewsAsync(string userId, string? filter = "upcoming"); // "upcoming", "past", "all"
    Task<List<InterviewDto>> GetInterviewsForCalendarAsync(string userId, DateTime startDate, DateTime endDate);
    Task<List<InterviewDto>> GetByApplicationIdAsync(string userId, int applicationId);
    Task<InterviewDto?> GetByIdAsync(string userId, int id);
    Task<(bool Success, string Message, InterviewDto? Data, bool HasOverlapWarning)> CreateAsync(string userId, CreateInterviewDto dto);
    Task<(bool Success, string Message, InterviewDto? Data)> UpdateAsync(string userId, int id, UpdateInterviewDto dto);
    Task<(bool Success, string Message)> DeleteAsync(string userId, int id);
}

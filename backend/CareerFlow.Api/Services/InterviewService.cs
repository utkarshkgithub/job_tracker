using CareerFlow.Api.Data;
using CareerFlow.Api.DTOs;
using CareerFlow.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace CareerFlow.Api.Services;

public class InterviewService : IInterviewService
{
    private readonly CareerFlowDbContext _context;
    private readonly ILogger<InterviewService> _logger;

    public InterviewService(CareerFlowDbContext context, ILogger<InterviewService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<InterviewDto>> GetInterviewsAsync(string userId, string? filter = "upcoming")
    {
        var now = DateTime.UtcNow;
        var query = _context.Interviews
            .AsNoTracking()
            .Include(i => i.JobApplication)
            .Where(i => i.UserId == userId);

        switch (filter?.ToLower())
        {
            case "past":
                query = query.Where(i => i.ScheduledAt < now)
                             .OrderByDescending(i => i.ScheduledAt);
                break;
            case "all":
                query = query.OrderBy(i => i.ScheduledAt);
                break;
            default: // "upcoming"
                query = query.Where(i => i.ScheduledAt >= now)
                             .OrderBy(i => i.ScheduledAt);
                break;
        }

        return await query.Select(i => MapToDto(i)).ToListAsync();
    }

    public async Task<List<InterviewDto>> GetInterviewsForCalendarAsync(string userId, DateTime startDate, DateTime endDate)
    {
        return await _context.Interviews
            .AsNoTracking()
            .Include(i => i.JobApplication)
            .Where(i => i.UserId == userId && i.ScheduledAt >= startDate && i.ScheduledAt <= endDate)
            .OrderBy(i => i.ScheduledAt)
            .Select(i => MapToDto(i))
            .ToListAsync();
    }

    public async Task<List<InterviewDto>> GetByApplicationIdAsync(string userId, int applicationId)
    {
        // First verify application belongs to user
        var userOwnsApp = await _context.JobApplications
            .AnyAsync(a => a.UserId == userId && a.Id == applicationId);

        if (!userOwnsApp)
        {
            return new List<InterviewDto>();
        }

        return await _context.Interviews
            .AsNoTracking()
            .Include(i => i.JobApplication)
            .Where(i => i.UserId == userId && i.JobApplicationId == applicationId)
            .OrderBy(i => i.ScheduledAt)
            .Select(i => MapToDto(i))
            .ToListAsync();
    }

    public async Task<InterviewDto?> GetByIdAsync(string userId, int id)
    {
        var interview = await _context.Interviews
            .AsNoTracking()
            .Include(i => i.JobApplication)
            .FirstOrDefaultAsync(i => i.UserId == userId && i.Id == id);

        return interview == null ? null : MapToDto(interview);
    }

    public async Task<(bool Success, string Message, InterviewDto? Data, bool HasOverlapWarning)> CreateAsync(
        string userId,
        CreateInterviewDto dto)
    {
        // Check application exists and belongs to user
        var application = await _context.JobApplications
            .FirstOrDefaultAsync(a => a.UserId == userId && a.Id == dto.JobApplicationId);

        if (application == null)
        {
            return (false, "Associated job application was not found or is unauthorized.", null, false);
        }

        // Check for interview overlap warning (scheduled within 45 minutes of another interview)
        var windowStart = dto.ScheduledAt.AddMinutes(-45);
        var windowEnd = dto.ScheduledAt.AddMinutes(45);
        var hasOverlap = await _context.Interviews
            .AnyAsync(i => i.UserId == userId && i.ScheduledAt >= windowStart && i.ScheduledAt <= windowEnd);

        var interview = new Interview
        {
            UserId = userId,
            JobApplicationId = dto.JobApplicationId,
            Round = dto.Round.Trim(),
            Type = dto.Type.Trim(),
            ScheduledAt = dto.ScheduledAt,
            MeetingUrl = string.IsNullOrWhiteSpace(dto.MeetingUrl) ? null : dto.MeetingUrl.Trim(),
            Notes = dto.Notes?.Trim(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Interviews.Add(interview);
        await _context.SaveChangesAsync();

        // Reload with JobApplication navigation
        var created = await GetByIdAsync(userId, interview.Id);
        return (true, "Interview scheduled successfully.", created, hasOverlap);
    }

    public async Task<(bool Success, string Message, InterviewDto? Data)> UpdateAsync(
        string userId,
        int id,
        UpdateInterviewDto dto)
    {
        var interview = await _context.Interviews
            .Include(i => i.JobApplication)
            .FirstOrDefaultAsync(i => i.UserId == userId && i.Id == id);

        if (interview == null)
        {
            return (false, "Interview not found or unauthorized.", null);
        }

        interview.Round = dto.Round.Trim();
        interview.Type = dto.Type.Trim();
        interview.ScheduledAt = dto.ScheduledAt;
        interview.MeetingUrl = string.IsNullOrWhiteSpace(dto.MeetingUrl) ? null : dto.MeetingUrl.Trim();
        interview.Notes = dto.Notes?.Trim();
        interview.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return (true, "Interview updated successfully.", MapToDto(interview));
    }

    public async Task<(bool Success, string Message)> DeleteAsync(string userId, int id)
    {
        var interview = await _context.Interviews
            .FirstOrDefaultAsync(i => i.UserId == userId && i.Id == id);

        if (interview == null)
        {
            return (false, "Interview not found or unauthorized.");
        }

        _context.Interviews.Remove(interview);
        await _context.SaveChangesAsync();

        return (true, "Interview deleted successfully.");
    }

    private static InterviewDto MapToDto(Interview i)
    {
        return new InterviewDto
        {
            Id = i.Id,
            JobApplicationId = i.JobApplicationId,
            CompanyName = i.JobApplication?.CompanyName ?? string.Empty,
            JobTitle = i.JobApplication?.JobTitle ?? string.Empty,
            Round = i.Round,
            Type = i.Type,
            ScheduledAt = i.ScheduledAt,
            MeetingUrl = i.MeetingUrl,
            Notes = i.Notes,
            CreatedAt = i.CreatedAt,
            UpdatedAt = i.UpdatedAt
        };
    }
}

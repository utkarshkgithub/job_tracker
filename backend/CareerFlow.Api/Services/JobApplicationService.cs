using CareerFlow.Api.Data;
using CareerFlow.Api.DTOs;
using CareerFlow.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace CareerFlow.Api.Services;

public class JobApplicationService : IJobApplicationService
{
    private readonly CareerFlowDbContext _context;
    private readonly ILogger<JobApplicationService> _logger;

    public JobApplicationService(CareerFlowDbContext context, ILogger<JobApplicationService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<PagedResult<JobApplicationDto>> GetApplicationsAsync(string userId, ApplicationFilterDto filter)
    {
        var query = _context.JobApplications
            .AsNoTracking()
            .Where(a => a.UserId == userId);

        // Search
        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim().ToLower();
            query = query.Where(a => a.CompanyName.ToLower().Contains(search) || a.JobTitle.ToLower().Contains(search));
        }

        // Status
        if (filter.Status.HasValue)
        {
            query = query.Where(a => a.Status == filter.Status.Value);
        }

        // Date Filter
        var now = DateTime.UtcNow;
        if (!string.IsNullOrWhiteSpace(filter.DateFilter))
        {
            switch (filter.DateFilter.ToLower())
            {
                case "7days":
                    var d7 = now.AddDays(-7);
                    query = query.Where(a => a.ApplicationDate >= d7);
                    break;
                case "30days":
                    var d30 = now.AddDays(-30);
                    query = query.Where(a => a.ApplicationDate >= d30);
                    break;
                case "90days":
                    var d90 = now.AddDays(-90);
                    query = query.Where(a => a.ApplicationDate >= d90);
                    break;
                case "custom":
                    if (filter.CustomStartDate.HasValue)
                    {
                        query = query.Where(a => a.ApplicationDate >= filter.CustomStartDate.Value);
                    }
                    if (filter.CustomEndDate.HasValue)
                    {
                        var endOfDay = filter.CustomEndDate.Value.Date.AddDays(1).AddTicks(-1);
                        query = query.Where(a => a.ApplicationDate <= endOfDay);
                    }
                    break;
            }
        }

        // Sorting
        query = (filter.SortBy?.ToLower()) switch
        {
            "newest" => query.OrderByDescending(a => a.ApplicationDate).ThenByDescending(a => a.Id),
            "oldest" => query.OrderBy(a => a.ApplicationDate).ThenBy(a => a.Id),
            "company_asc" => query.OrderBy(a => a.CompanyName).ThenBy(a => a.JobTitle),
            _ => query.OrderByDescending(a => a.UpdatedAt).ThenByDescending(a => a.Id),
        };

        var totalCount = await query.CountAsync();
        var page = filter.Page < 1 ? 1 : filter.Page;
        var pageSize = filter.PageSize < 1 ? 10 : (filter.PageSize > 100 ? 100 : filter.PageSize);

        var applications = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
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
                InterviewCount = a.Interviews.Count,
                NextInterviewDate = a.Interviews
                    .Where(i => i.ScheduledAt >= now)
                    .OrderBy(i => i.ScheduledAt)
                    .Select(i => (DateTime?)i.ScheduledAt)
                    .FirstOrDefault(),
                NextInterviewRound = a.Interviews
                    .Where(i => i.ScheduledAt >= now)
                    .OrderBy(i => i.ScheduledAt)
                    .Select(i => i.Round)
                    .FirstOrDefault()
            })
            .ToListAsync();

        return new PagedResult<JobApplicationDto>
        {
            Items = applications,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<JobApplicationDto?> GetByIdAsync(string userId, int id)
    {
        var app = await _context.JobApplications
            .AsNoTracking()
            .Where(a => a.UserId == userId && a.Id == id)
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
                InterviewCount = a.Interviews.Count,
                NextInterviewDate = a.Interviews
                    .Where(i => i.ScheduledAt >= DateTime.UtcNow)
                    .OrderBy(i => i.ScheduledAt)
                    .Select(i => (DateTime?)i.ScheduledAt)
                    .FirstOrDefault(),
                NextInterviewRound = a.Interviews
                    .Where(i => i.ScheduledAt >= DateTime.UtcNow)
                    .OrderBy(i => i.ScheduledAt)
                    .Select(i => i.Round)
                    .FirstOrDefault()
            })
            .FirstOrDefaultAsync();

        return app;
    }

    public async Task<(bool Success, string Message, JobApplicationDto? Data, bool IsDuplicateWarning)> CreateAsync(
        string userId,
        CreateJobApplicationDto dto)
    {
        var companyName = dto.CompanyName.Trim();
        var jobTitle = dto.JobTitle.Trim();

        if (string.IsNullOrWhiteSpace(companyName))
        {
            return (false, "Company name cannot be empty or whitespace.", null, false);
        }

        if (string.IsNullOrWhiteSpace(jobTitle))
        {
            return (false, "Job title cannot be empty or whitespace.", null, false);
        }

        // Check for potential duplicate warning (same company + job title for this user)
        var hasDuplicate = await _context.JobApplications
            .AnyAsync(a => a.UserId == userId &&
                           a.CompanyName.ToLower() == companyName.ToLower() &&
                           a.JobTitle.ToLower() == jobTitle.ToLower());

        var application = new JobApplication
        {
            UserId = userId,
            CompanyName = companyName,
            JobTitle = jobTitle,
            JobPostingUrl = string.IsNullOrWhiteSpace(dto.JobPostingUrl) ? null : dto.JobPostingUrl.Trim(),
            ApplicationDate = dto.ApplicationDate,
            Status = dto.Status,
            Notes = dto.Notes?.Trim(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.JobApplications.Add(application);
        await _context.SaveChangesAsync();

        var resultDto = new JobApplicationDto
        {
            Id = application.Id,
            CompanyName = application.CompanyName,
            JobTitle = application.JobTitle,
            JobPostingUrl = application.JobPostingUrl,
            ApplicationDate = application.ApplicationDate,
            Status = application.Status,
            Notes = application.Notes,
            CreatedAt = application.CreatedAt,
            UpdatedAt = application.UpdatedAt,
            InterviewCount = 0
        };

        return (true, "Application added successfully.", resultDto, hasDuplicate);
    }

    public async Task<(bool Success, string Message, JobApplicationDto? Data)> UpdateAsync(
        string userId,
        int id,
        UpdateJobApplicationDto dto)
    {
        var application = await _context.JobApplications
            .FirstOrDefaultAsync(a => a.UserId == userId && a.Id == id);

        if (application == null)
        {
            return (false, "Application not found or unauthorized.", null);
        }

        var companyName = dto.CompanyName.Trim();
        var jobTitle = dto.JobTitle.Trim();

        if (string.IsNullOrWhiteSpace(companyName))
        {
            return (false, "Company name cannot be empty or whitespace.", null);
        }

        if (string.IsNullOrWhiteSpace(jobTitle))
        {
            return (false, "Job title cannot be empty or whitespace.", null);
        }

        application.CompanyName = companyName;
        application.JobTitle = jobTitle;
        application.JobPostingUrl = string.IsNullOrWhiteSpace(dto.JobPostingUrl) ? null : dto.JobPostingUrl.Trim();
        application.ApplicationDate = dto.ApplicationDate;
        application.Status = dto.Status;
        application.Notes = dto.Notes?.Trim();
        application.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        var result = await GetByIdAsync(userId, id);
        return (true, "Application updated successfully.", result);
    }

    public async Task<(bool Success, string Message, JobApplicationDto? Data)> UpdateStatusAsync(
        string userId,
        int id,
        ApplicationStatus status)
    {
        var application = await _context.JobApplications
            .FirstOrDefaultAsync(a => a.UserId == userId && a.Id == id);

        if (application == null)
        {
            return (false, "Application not found or unauthorized.", null);
        }

        application.Status = status;
        application.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        var result = await GetByIdAsync(userId, id);
        return (true, "Status updated successfully.", result);
    }

    public async Task<(bool Success, string Message)> DeleteAsync(string userId, int id)
    {
        var application = await _context.JobApplications
            .Include(a => a.Interviews)
            .FirstOrDefaultAsync(a => a.UserId == userId && a.Id == id);

        if (application == null)
        {
            return (false, "Application not found or unauthorized.");
        }

        _context.JobApplications.Remove(application);
        await _context.SaveChangesAsync();

        return (true, "Application and associated interviews deleted successfully.");
    }

    public async Task<List<ApplicationLookupDto>> GetLookupListAsync(string userId)
    {
        return await _context.JobApplications
            .AsNoTracking()
            .Where(a => a.UserId == userId)
            .OrderBy(a => a.CompanyName)
            .ThenBy(a => a.JobTitle)
            .Select(a => new ApplicationLookupDto
            {
                Id = a.Id,
                CompanyName = a.CompanyName,
                JobTitle = a.JobTitle
            })
            .ToListAsync();
    }
}

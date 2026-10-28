using CareerFlow.Api.DTOs;
using CareerFlow.Api.Models;

namespace CareerFlow.Api.Services;

public interface IJobApplicationService
{
    Task<PagedResult<JobApplicationDto>> GetApplicationsAsync(string userId, ApplicationFilterDto filter);
    Task<JobApplicationDto?> GetByIdAsync(string userId, int id);
    Task<(bool Success, string Message, JobApplicationDto? Data, bool IsDuplicateWarning)> CreateAsync(string userId, CreateJobApplicationDto dto);
    Task<(bool Success, string Message, JobApplicationDto? Data)> UpdateAsync(string userId, int id, UpdateJobApplicationDto dto);
    Task<(bool Success, string Message, JobApplicationDto? Data)> UpdateStatusAsync(string userId, int id, ApplicationStatus status);
    Task<(bool Success, string Message)> DeleteAsync(string userId, int id);
    Task<List<ApplicationLookupDto>> GetLookupListAsync(string userId);
}

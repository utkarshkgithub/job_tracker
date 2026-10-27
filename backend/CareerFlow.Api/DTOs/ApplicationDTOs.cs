using System.ComponentModel.DataAnnotations;
using CareerFlow.Api.Models;

namespace CareerFlow.Api.DTOs;

public class JobApplicationDto
{
    public int Id { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string JobTitle { get; set; } = string.Empty;
    public string? JobPostingUrl { get; set; }
    public DateTime ApplicationDate { get; set; }
    public ApplicationStatus Status { get; set; }
    public string StatusName => Status.ToString();
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public int InterviewCount { get; set; }
    public DateTime? NextInterviewDate { get; set; }
    public string? NextInterviewRound { get; set; }
}

public class CreateJobApplicationDto
{
    [Required(ErrorMessage = "Company name is required.")]
    [MaxLength(150, ErrorMessage = "Company name cannot exceed 150 characters.")]
    public string CompanyName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Job title is required.")]
    [MaxLength(150, ErrorMessage = "Job title cannot exceed 150 characters.")]
    public string JobTitle { get; set; } = string.Empty;

    [MaxLength(500, ErrorMessage = "Job URL cannot exceed 500 characters.")]
    [Url(ErrorMessage = "Job posting URL must be a valid URL.")]
    public string? JobPostingUrl { get; set; }

    [Required(ErrorMessage = "Application date is required.")]
    public DateTime ApplicationDate { get; set; } = DateTime.UtcNow.Date;

    [Required(ErrorMessage = "Status is required.")]
    public ApplicationStatus Status { get; set; } = ApplicationStatus.Applied;

    [MaxLength(2000, ErrorMessage = "Notes cannot exceed 2000 characters.")]
    public string? Notes { get; set; }
}

public class UpdateJobApplicationDto
{
    [Required(ErrorMessage = "Company name is required.")]
    [MaxLength(150, ErrorMessage = "Company name cannot exceed 150 characters.")]
    public string CompanyName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Job title is required.")]
    [MaxLength(150, ErrorMessage = "Job title cannot exceed 150 characters.")]
    public string JobTitle { get; set; } = string.Empty;

    [MaxLength(500, ErrorMessage = "Job URL cannot exceed 500 characters.")]
    [Url(ErrorMessage = "Job posting URL must be a valid URL.")]
    public string? JobPostingUrl { get; set; }

    [Required(ErrorMessage = "Application date is required.")]
    public DateTime ApplicationDate { get; set; }

    [Required(ErrorMessage = "Status is required.")]
    public ApplicationStatus Status { get; set; }

    [MaxLength(2000, ErrorMessage = "Notes cannot exceed 2000 characters.")]
    public string? Notes { get; set; }
}

public class UpdateStatusDto
{
    [Required]
    public ApplicationStatus Status { get; set; }
}

public class ApplicationFilterDto
{
    public string? Search { get; set; }
    public ApplicationStatus? Status { get; set; }
    public string? DateFilter { get; set; } // "all", "7days", "30days", "90days", "custom"
    public DateTime? CustomStartDate { get; set; }
    public DateTime? CustomEndDate { get; set; }
    public string? SortBy { get; set; } // "recent_updated", "newest", "oldest", "company_asc", "upcoming_interview"
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / (PageSize > 0 ? PageSize : 10));
    public bool HasPrevious => Page > 1;
    public bool HasNext => Page < TotalPages;
}

using System.ComponentModel.DataAnnotations;

namespace CareerFlow.Api.DTOs;

public class InterviewDto
{
    public int Id { get; set; }
    public int JobApplicationId { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string JobTitle { get; set; } = string.Empty;
    public string Round { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public DateTime ScheduledAt { get; set; }
    public string? MeetingUrl { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public bool IsUpcoming => ScheduledAt > DateTime.UtcNow;
}

public class CreateInterviewDto
{
    [Required(ErrorMessage = "Application selection is required.")]
    public int JobApplicationId { get; set; }

    [Required(ErrorMessage = "Interview round is required.")]
    [MaxLength(100, ErrorMessage = "Interview round cannot exceed 100 characters.")]
    public string Round { get; set; } = "Technical";

    [Required(ErrorMessage = "Interview type is required.")]
    [MaxLength(50, ErrorMessage = "Interview type cannot exceed 50 characters.")]
    public string Type { get; set; } = "Video call";

    [Required(ErrorMessage = "Date and time are required.")]
    public DateTime ScheduledAt { get; set; }

    [MaxLength(500, ErrorMessage = "Meeting URL cannot exceed 500 characters.")]
    [Url(ErrorMessage = "Meeting URL must be a valid URL.")]
    public string? MeetingUrl { get; set; }

    [MaxLength(2000, ErrorMessage = "Notes cannot exceed 2000 characters.")]
    public string? Notes { get; set; }
}

public class UpdateInterviewDto
{
    [Required(ErrorMessage = "Interview round is required.")]
    [MaxLength(100, ErrorMessage = "Interview round cannot exceed 100 characters.")]
    public string Round { get; set; } = "Technical";

    [Required(ErrorMessage = "Interview type is required.")]
    [MaxLength(50, ErrorMessage = "Interview type cannot exceed 50 characters.")]
    public string Type { get; set; } = "Video call";

    [Required(ErrorMessage = "Date and time are required.")]
    public DateTime ScheduledAt { get; set; }

    [MaxLength(500, ErrorMessage = "Meeting URL cannot exceed 500 characters.")]
    [Url(ErrorMessage = "Meeting URL must be a valid URL.")]
    public string? MeetingUrl { get; set; }

    [MaxLength(2000, ErrorMessage = "Notes cannot exceed 2000 characters.")]
    public string? Notes { get; set; }
}

public class ApplicationLookupDto
{
    public int Id { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string JobTitle { get; set; } = string.Empty;
    public string DisplayText => $"{CompanyName} — {JobTitle}";
}

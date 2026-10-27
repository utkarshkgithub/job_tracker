using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CareerFlow.Api.Models;

public class Interview
{
    public int Id { get; set; }

    [Required]
    public int JobApplicationId { get; set; }

    public JobApplication? JobApplication { get; set; }

    [Required]
    public string UserId { get; set; } = string.Empty;

    public ApplicationUser? User { get; set; }

    [Required]
    [MaxLength(100)]
    public string Round { get; set; } = "Technical"; // Screening, Technical, HR, Managerial, Final, Other

    [Required]
    [MaxLength(50)]
    public string Type { get; set; } = "Video call"; // Video call, Phone call, In person, Other

    public DateTime ScheduledAt { get; set; } // UTC date and time

    [MaxLength(500)]
    public string? MeetingUrl { get; set; }

    [MaxLength(2000)]
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

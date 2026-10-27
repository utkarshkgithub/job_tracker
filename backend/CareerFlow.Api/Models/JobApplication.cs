using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CareerFlow.Api.Models;

public class JobApplication
{
    public int Id { get; set; }

    [Required]
    public string UserId { get; set; } = string.Empty;

    public ApplicationUser? User { get; set; }

    [Required]
    [MaxLength(150)]
    public string CompanyName { get; set; } = string.Empty;

    [Required]
    [MaxLength(150)]
    public string JobTitle { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? JobPostingUrl { get; set; }

    public DateTime ApplicationDate { get; set; }

    public ApplicationStatus Status { get; set; } = ApplicationStatus.Applied;

    [MaxLength(2000)]
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Interview> Interviews { get; set; } = new List<Interview>();
}

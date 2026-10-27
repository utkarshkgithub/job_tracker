using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace CareerFlow.Api.Models;

public class ApplicationUser : IdentityUser
{
    [Required]
    [MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [MaxLength(20)]
    public string Theme { get; set; } = "system"; // light, dark, system

    [MaxLength(30)]
    public string DateFormat { get; set; } = "DD MMM YYYY";

    [MaxLength(20)]
    public string TimeFormat { get; set; } = "12-hour"; // 12-hour, 24-hour

    [MaxLength(50)]
    public string TimeZoneId { get; set; } = "UTC";

    public ICollection<JobApplication> JobApplications { get; set; } = new List<JobApplication>();
    public ICollection<Interview> Interviews { get; set; } = new List<Interview>();
}
